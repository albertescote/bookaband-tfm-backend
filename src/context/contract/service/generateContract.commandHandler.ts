import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GenerateContractCommand } from "./generateContract.command";
import { Injectable } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { PDFDocument, rgb } from "pdf-lib";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { EXTERNAL_URL } from "../../../config";
import { VidsignerApiWrapper } from "../infrastructure/vidsignerApiWrapper";
import User from "../../shared/domain/user";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { UserNotFoundException } from "../exceptions/userNotFoundException";
import { BandRole } from "../../band/domain/bandRole";
import { Signer } from "../domain/signer";

@Injectable()
@CommandHandler(GenerateContractCommand)
export class GenerateContractCommandHandler
  implements ICommandHandler<GenerateContractCommand>
{
  constructor(
    private readonly contractService: ContractService,
    private readonly moduleConnectors: ModuleConnectors,
    private readonly vidsignerApiWrapper: VidsignerApiWrapper,
  ) {}

  async execute(command: GenerateContractCommand): Promise<void> {
    const { bookingId, bandId, authorized } = command;

    const booking = await this.moduleConnectors.getBookingById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    const band = await this.moduleConnectors.getBandById(bandId);
    if (!band) {
      throw new BandNotFoundException(bookingId);
    }

    const user = await this.moduleConnectors.obtainUserInformation(
      authorized.id,
    );
    if (!user) {
      throw new UserNotFoundException(authorized.id);
    }
    const pdfBytes = await this.generatePdfDocument(booking, band.name, user);
    const fileName = `contract-${bookingId}-${Date.now()}.pdf`;

    await this.moduleConnectors.storeFile(fileName, pdfBytes);

    const member = band.members.find(
      (member) => member.id === user.getId().toPrimitive(),
    );
    let bandSignerUser: User;
    if (member.role !== BandRole.ADMIN) {
      const adminMember = band.members.find(
        (member) => member.role === BandRole.MEMBER,
      );
      bandSignerUser = await this.moduleConnectors.obtainUserInformation(
        adminMember.id,
      );
    } else {
      bandSignerUser = user;
    }

    const clientSignerUser = await this.moduleConnectors.obtainUserInformation(
      booking.userId,
    );

    const signatureResponse = await this.vidsignerApiWrapper.signDocument(
      fileName,
      pdfBytes,
      "BookaBand",
      false,
      [
        Signer.createDefault(
          clientSignerUser.getFullName(),
          "DNI",
          clientSignerUser.getNationalId(),
          clientSignerUser.getPhoneNumber().replace(/ /g, ""),
          clientSignerUser.getEmail(),
          fileName,
          200,
        ),
        Signer.createDefault(
          bandSignerUser.getFullName(),
          "DNI",
          bandSignerUser.getNationalId(),
          bandSignerUser.getPhoneNumber().replace(/ /g, ""),
          bandSignerUser.getEmail(),
          fileName,
          170,
        ),
      ],
      EXTERNAL_URL + "/contracts/notifications",
    );

    await this.contractService.create(authorized, {
      bookingId,
      fileUrl: `${EXTERNAL_URL}/files/${fileName}`,
      vidsignerDocGui: signatureResponse.DocGUI,
    });
  }

  private async generatePdfDocument(
    booking: {
      name: string;
      initDate: Date;
      venue: string;
      addressLine1: string;
      city: string;
      country: string;
    },
    bandName: string,
    user: User,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { height } = page.getSize();

    page.drawText("Contract Agreement", {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Event: ${booking.name}`, {
      x: 50,
      y: height - 100,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ${new Date(booking.initDate).toLocaleDateString()}`, {
      x: 50,
      y: height - 120,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Venue: ${booking.venue}`, {
      x: 50,
      y: height - 140,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      `Address: ${booking.addressLine1}, ${booking.city}, ${booking.country}`,
      {
        x: 50,
        y: height - 160,
        size: 12,
        color: rgb(0, 0, 0),
      },
    );

    page.drawText("Band Information:", {
      x: 50,
      y: height - 200,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Name: ${bandName}`, {
      x: 50,
      y: height - 220,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText("Client Information:", {
      x: 50,
      y: height - 260,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      `Name: ${user.toPrimitives().firstName + " " + user.toPrimitives().familyName}`,
      {
        x: 50,
        y: height - 280,
        size: 12,
        color: rgb(0, 0, 0),
      },
    );

    page.drawText("Terms and Conditions:", {
      x: 50,
      y: height - 340,
      size: 14,
      color: rgb(0, 0, 0),
    });

    const terms = [
      "1. The band agrees to perform at the specified venue on the agreed date.",
      "2. The client agrees to pay the agreed amount in full before the event.",
      "3. Any changes to the agreement must be made in writing and agreed upon by both parties.",
      "4. The band reserves the right to cancel the performance in case of force majeure.",
      "5. The client is responsible for providing necessary equipment and facilities.",
    ];

    terms.forEach((term, index) => {
      page.drawText(term, {
        x: 50,
        y: height - 360 - index * 20,
        size: 10,
        color: rgb(0, 0, 0),
      });
    });

    page.drawText("Band Representative Signature:", {
      x: 50,
      y: height - 500,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText("Client Signature:", {
      x: 50,
      y: height - 550,
      size: 12,
      color: rgb(0, 0, 0),
    });

    const pdfUint8Array = await pdfDoc.save();
    return Buffer.from(pdfUint8Array);
  }
}

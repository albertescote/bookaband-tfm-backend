import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GenerateContractCommand } from "./generateContract.command";
import { Injectable } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { PDFDocument, rgb } from "pdf-lib";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { EXTERNAL_URL } from "../../../config";

@Injectable()
@CommandHandler(GenerateContractCommand)
export class GenerateContractCommandHandler
  implements ICommandHandler<GenerateContractCommand>
{
  constructor(
    private readonly contractService: ContractService,
    private readonly moduleConnectors: ModuleConnectors,
  ) {}

  async execute(command: GenerateContractCommand): Promise<void> {
    const { bookingId, bandId, authorized } = command;

    // Get booking details
    const booking = await this.moduleConnectors.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Get band details
    const band = await this.moduleConnectors.getBandById(bandId);
    if (!band) {
      throw new Error("Band not found");
    }

    // Get user details
    const user = await this.moduleConnectors.obtainUserInformation(
      authorized.id,
    );
    if (!user) {
      throw new Error("User not found");
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Add content to the PDF
    page.drawText("Contract Agreement", {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Add booking details
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

    // Add band details
    page.drawText("Band Information:", {
      x: 50,
      y: height - 200,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Name: ${band.name}`, {
      x: 50,
      y: height - 220,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Add client details
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

    // Add terms and conditions
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

    // Add signature lines
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

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Generate a unique filename
    const fileName = `contract-${bookingId}-${Date.now()}.pdf`;

    // Store the PDF file
    await this.moduleConnectors.storeFile(fileName, Buffer.from(pdfBytes));

    // Create the contract
    await this.contractService.create(authorized, {
      bookingId,
      fileUrl: `${EXTERNAL_URL}/files/${fileName}`,
    });
  }
}

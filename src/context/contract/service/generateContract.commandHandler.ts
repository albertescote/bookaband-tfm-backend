import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GenerateContractCommand } from "./generateContract.command";
import { Injectable } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { FileUploadService } from "../../fileUpload/service/fileUpload.service";
import { PDFDocument, rgb } from "pdf-lib";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { ContractStatus } from "../domain/contractStatus";

@Injectable()
@CommandHandler(GenerateContractCommand)
export class GenerateContractCommandHandler
  implements ICommandHandler<GenerateContractCommand>
{
  constructor(
    private readonly contractService: ContractService,
    private readonly fileUploadService: FileUploadService,
    private readonly moduleConnectors: ModuleConnectors,
  ) {}

  async execute(command: GenerateContractCommand): Promise<void> {
    const { bookingId, bandId, authorized } = command;

    const booking = await this.moduleConnectors.getBookingById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    const band = await this.moduleConnectors.getBandById(bandId);
    if (!band) {
      throw new Error("Band not found");
    }

    const user = await this.moduleConnectors.obtainUserInformation(
      authorized.id,
    );
    if (!user) {
      throw new Error("User not found");
    }

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    const fontSize = 12;

    // Add content to PDF
    page.drawText("Performance Contract", {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Add booking details
    page.drawText(`Event: ${booking.name}`, {
      x: 50,
      y: height - 100,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ${booking.initDate.toLocaleDateString()}`, {
      x: 50,
      y: height - 120,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Venue: ${booking.venue}`, {
      x: 50,
      y: height - 140,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      `Address: ${booking.addressLine1}, ${booking.city}, ${booking.country}`,
      {
        x: 50,
        y: height - 160,
        size: fontSize,
        color: rgb(0, 0, 0),
      },
    );

    // Add band details
    page.drawText("Band Information:", {
      x: 50,
      y: height - 200,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Name: ${band.name}`, {
      x: 50,
      y: height - 220,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Price: $${band.price}`, {
      x: 50,
      y: height - 240,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    // Add client details
    page.drawText("Client Information:", {
      x: 50,
      y: height - 280,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      `Name: ${user.toPrimitives().firstName} ${user.toPrimitives().familyName}`,
      {
        x: 50,
        y: height - 300,
        size: fontSize,
        color: rgb(0, 0, 0),
      },
    );

    page.drawText(`Email: ${user.toPrimitives().email}`, {
      x: 50,
      y: height - 320,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const filename = `contract-${bookingId}.pdf`;
    const filePath = `./uploads/${filename}`;

    // Write file to disk
    const fs = require("fs");
    fs.writeFileSync(filePath, pdfBytes);

    // Create contract record
    await this.contractService.create(authorized, {
      bookingId,
      status: ContractStatus.PENDING,
      fileUrl: `/files/${filename}`,
    });
  }
}

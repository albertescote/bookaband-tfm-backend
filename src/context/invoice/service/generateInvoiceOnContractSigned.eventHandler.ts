import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ContractSignedEvent } from "../../shared/eventBus/domain/contractSigned.event";
import { InvoiceRepository } from "../infrastructure/invoice.repository";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { PDFDocument, rgb } from "pdf-lib";
import { EXTERNAL_URL } from "../../../config";
import { Invoice } from "../domain/invoice";
import { UnableToCreateInvoiceException } from "../exceptions/unableToCreateInvoiceException";
import ContractId from "../../shared/domain/contractId";
import User from "../../shared/domain/user";
import { BookingNotFoundForContractIdException } from "../exceptions/bookingNotFoundForContractIdException";
import { UserNotFoundForInvoiceException } from "../exceptions/userNotFoundForInvoiceException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";

@Injectable()
@EventsHandler(ContractSignedEvent)
export class GenerateInvoiceOnContractSignedEventHandler
  implements IEventHandler<ContractSignedEvent>
{
  constructor(
    private invoiceRepository: InvoiceRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async handle(event: ContractSignedEvent): Promise<void> {
    const { contractId } = event;
    const booking =
      await this.moduleConnectors.getBookingByContractId(contractId);
    if (!booking) {
      throw new BookingNotFoundForContractIdException(contractId);
    }

    const band = await this.moduleConnectors.getBandById(booking.bandId);
    if (!band) {
      throw new BandNotFoundException(booking.bandId);
    }

    const user = await this.moduleConnectors.obtainUserInformation(
      booking.userId,
    );
    if (!user) {
      throw new UserNotFoundForInvoiceException(booking.userId);
    }

    const pdfBytes = await this.generatePdfDocument(
      booking,
      band.name,
      user,
      band.price,
    );
    const fileName = `invoice-${booking.id}-${Date.now()}.pdf`;

    await this.moduleConnectors.storeFile(fileName, pdfBytes);

    const invoice = Invoice.create(
      new ContractId(contractId),
      band.price,
      `${EXTERNAL_URL}/files/${fileName}`,
    );

    const storedInvoice = await this.invoiceRepository.create(invoice);
    if (!storedInvoice) {
      throw new UnableToCreateInvoiceException();
    }
  }

  private async generatePdfDocument(
    booking: {
      id: string;
      name: string;
      initDate: Date;
      venue: string;
      addressLine1: string;
      city: string;
      country: string;
    },
    bandName: string,
    user: User,
    price: number,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { height } = page.getSize();

    // Add title
    page.drawText("Invoice", {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Add invoice details
    page.drawText(`Invoice Number: ${booking.id}`, {
      x: 50,
      y: height - 100,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 120,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Add event details
    page.drawText("Event Details:", {
      x: 50,
      y: height - 160,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Event: ${booking.name}`, {
      x: 50,
      y: height - 180,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Date: ${new Date(booking.initDate).toLocaleDateString()}`, {
      x: 50,
      y: height - 200,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Venue: ${booking.venue}`, {
      x: 50,
      y: height - 220,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(
      `Address: ${booking.addressLine1}, ${booking.city}, ${booking.country}`,
      {
        x: 50,
        y: height - 240,
        size: 12,
        color: rgb(0, 0, 0),
      },
    );

    // Add band details
    page.drawText("Band Information:", {
      x: 50,
      y: height - 280,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Name: ${bandName}`, {
      x: 50,
      y: height - 300,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Add client details
    page.drawText("Client Information:", {
      x: 50,
      y: height - 340,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Name: ${user.getFullName()}`, {
      x: 50,
      y: height - 360,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Email: ${user.getEmail()}`, {
      x: 50,
      y: height - 380,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Add payment details
    page.drawText("Payment Details:", {
      x: 50,
      y: height - 420,
      size: 14,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Amount: €${price.toFixed(2)}`, {
      x: 50,
      y: height - 440,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText("Status: Pending", {
      x: 50,
      y: height - 460,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Add payment instructions
    page.drawText("Payment Instructions:", {
      x: 50,
      y: height - 500,
      size: 14,
      color: rgb(0, 0, 0),
    });

    const instructions = [
      "1. Please make the payment within 7 days of receiving this invoice.",
      "2. Use the invoice number as reference when making the payment.",
      "3. For any questions regarding payment, please contact the band directly.",
    ];

    instructions.forEach((instruction, index) => {
      page.drawText(instruction, {
        x: 50,
        y: height - 520 - index * 20,
        size: 10,
        color: rgb(0, 0, 0),
      });
    });

    const pdfUint8Array = await pdfDoc.save();
    return Buffer.from(pdfUint8Array);
  }
}

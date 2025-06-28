import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ContractSignedEvent } from "../../shared/eventBus/domain/contractSigned.event";
import { InvoiceRepository } from "../infrastructure/invoice.repository";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { EXTERNAL_URL } from "../../../config";
import { Invoice } from "../domain/invoice";
import { UnableToCreateInvoiceException } from "../exceptions/unableToCreateInvoiceException";
import ContractId from "../../shared/domain/contractId";
import User from "../../shared/domain/user";
import { BookingNotFoundForContractIdException } from "../exceptions/bookingNotFoundForContractIdException";
import { UserNotFoundForInvoiceException } from "../exceptions/userNotFoundForInvoiceException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";

interface BookingData {
  id: string;
  name: string;
  initDate: Date;
  endDate: Date;
  venue: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  postalCode: string;
  cost: number;
}

interface BandData {
  name: string;
  price: number;
  bandSize: string;
}

@Injectable()
@EventsHandler(ContractSignedEvent)
export class GenerateInvoiceOnContractSignedEventHandler
  implements IEventHandler<ContractSignedEvent>
{
  private static readonly A4_SIZE: [number, number] = [595.28, 841.89];
  private static readonly MARGIN_LEFT = 50;
  private static readonly MARGIN_RIGHT = 200;
  private static readonly INVOICE_NUMBER_PREFIX = "INV";
  private static readonly MIN_Y_POSITION = 100;

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
      band,
      user,
      booking.cost,
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
    booking: BookingData,
    band: BandData,
    user: User,
    price: number,
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage(
      GenerateInvoiceOnContractSignedEventHandler.A4_SIZE,
    );

    const { height, width } = currentPage.getSize();

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const primaryColor = rgb(0.2, 0.4, 0.8);
    const secondaryColor = rgb(0.3, 0.3, 0.3);
    const accentColor = rgb(0.8, 0.2, 0.2);

    let currentY = height - 50;

    this.drawTitle(currentPage, width, currentY, helveticaBold, primaryColor);
    currentY -= 40;

    this.drawInvoiceInfo(
      currentPage,
      booking,
      currentY,
      helveticaBold,
      secondaryColor,
    );
    currentY -= 70;

    const { page: eventInfoPage, y: eventInfoY } = this.checkAndCreateNewPage(
      pdfDoc,
      currentPage,
      currentY,
      height,
    );

    currentY = this.drawEventInfo(
      eventInfoPage,
      booking,
      eventInfoY,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
      pdfDoc,
      height,
    );

    const { page: bandInfoPage, y: bandInfoY } = this.checkAndCreateNewPage(
      pdfDoc,
      eventInfoPage,
      currentY,
      height,
    );

    currentY = this.drawBandInfo(
      bandInfoPage,
      band,
      bandInfoY,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
      pdfDoc,
      height,
    );

    const { page: clientInfoPage, y: clientInfoY } = this.checkAndCreateNewPage(
      pdfDoc,
      bandInfoPage,
      currentY,
      height,
    );

    currentY = this.drawClientInfo(
      clientInfoPage,
      user,
      clientInfoY,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
      pdfDoc,
      height,
    );

    const { page: paymentDetailsPage, y: paymentDetailsY } =
      this.checkAndCreateNewPage(pdfDoc, clientInfoPage, currentY, height);

    currentY = this.drawPaymentDetails(
      paymentDetailsPage,
      price,
      paymentDetailsY,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
    );

    const { page: paymentInstructionsPage, y: paymentInstructionsY } =
      this.checkAndCreateNewPage(pdfDoc, paymentDetailsPage, currentY, height);

    this.drawPaymentInstructions(
      paymentInstructionsPage,
      paymentInstructionsY,
      helveticaBold,
      helveticaFont,
      accentColor,
      pdfDoc,
      height,
    );

    const pdfUint8Array = await pdfDoc.save();
    return Buffer.from(pdfUint8Array);
  }

  private drawTitle(
    page: any,
    width: number,
    y: number,
    font: any,
    color: any,
  ): void {
    page.drawText("FACTURA", {
      x: width / 2 - 50,
      y,
      size: 24,
      font,
      color,
    });
  }

  private drawInvoiceInfo(
    page: any,
    booking: BookingData,
    y: number,
    font: any,
    color: any,
  ): void {
    const invoiceNumber = `${GenerateInvoiceOnContractSignedEventHandler.INVOICE_NUMBER_PREFIX}-${booking.id}`;

    page.drawText(`Número de Factura: ${invoiceNumber}`, {
      x: GenerateInvoiceOnContractSignedEventHandler.MARGIN_LEFT,
      y,
      size: 12,
      font,
      color,
    });

    page.drawText(
      `Fecha de Emisión: ${new Date().toLocaleDateString("es-ES")}`,
      {
        x: GenerateInvoiceOnContractSignedEventHandler.MARGIN_LEFT,
        y: y - 20,
        size: 12,
        font,
        color,
      },
    );
  }

  private drawEventInfo(
    page: any,
    booking: BookingData,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
    pdfDoc?: any,
    height?: number,
  ): number {
    this.drawSectionHeader(
      page,
      "DETALLES DEL EVENTO",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 30;

    const eventInfo = [
      { label: "Nombre del Evento:", value: booking.name },
      {
        label: "Fecha de Inicio:",
        value: this.formatDateTime(booking.initDate),
      },
      {
        label: "Fecha de Finalización:",
        value: this.formatDateTime(booking.endDate),
      },
      { label: "Lugar:", value: booking.venue },
      {
        label: "Dirección:",
        value: `${booking.addressLine1}${booking.addressLine2 ? ", " + booking.addressLine2 : ""}`,
      },
      { label: "Ciudad:", value: booking.city },
      { label: "Código Postal:", value: booking.postalCode },
      { label: "País:", value: booking.country },
    ];

    return this.drawInfoList(
      page,
      eventInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
      pdfDoc,
      height,
    );
  }

  private drawBandInfo(
    page: any,
    band: BandData,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
    pdfDoc?: any,
    height?: number,
  ): number {
    this.drawSectionHeader(
      page,
      "INFORMACIÓN DE LA BANDA",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 30;

    const bandInfo = [
      { label: "Nombre de la Banda:", value: band.name },
      { label: "Tamaño de la Banda:", value: band.bandSize },
      { label: "Precio por Hora:", value: `${band.price.toFixed(2)} €` },
    ];

    return this.drawInfoList(
      page,
      bandInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
      pdfDoc,
      height,
    );
  }

  private drawClientInfo(
    page: any,
    user: User,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
    pdfDoc?: any,
    height?: number,
  ): number {
    this.drawSectionHeader(
      page,
      "INFORMACIÓN DEL CLIENTE",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 30;

    const userPrimitives = user.toPrimitives();
    const clientInfo = [
      {
        label: "Nombre:",
        value: `${userPrimitives.firstName} ${userPrimitives.familyName}`,
      },
      { label: "Email:", value: userPrimitives.email },
      {
        label: "Teléfono:",
        value: userPrimitives.phoneNumber || "No especificado",
      },
      {
        label: "DNI/NIE:",
        value: userPrimitives.nationalId || "No especificado",
      },
    ];

    return this.drawInfoList(
      page,
      clientInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
      pdfDoc,
      height,
    );
  }

  private drawPaymentDetails(
    page: any,
    price: number,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
  ): number {
    this.drawSectionHeader(
      page,
      "DETALLES DE PAGO",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 30;

    const paymentInfo = [
      { label: "Importe Total:", value: `${price.toFixed(2)} €` },
      { label: "Estado:", value: "Pendiente de Pago" },
      { label: "Moneda:", value: "EUR (Euro)" },
      { label: "Método de Pago:", value: "Transferencia Bancaria" },
    ];

    currentY = this.drawInfoList(
      page,
      paymentInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
    );

    return currentY - 20;
  }

  private drawPaymentInstructions(
    page: any,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    accentColor: any,
    pdfDoc?: any,
    height?: number,
  ): number {
    this.drawSectionHeader(
      page,
      "INSTRUCCIONES DE PAGO",
      currentY,
      helveticaBold,
      accentColor,
    );
    currentY -= 30;

    const instructions = [
      "• Realice el pago dentro de los 7 días siguientes a la recepción de esta factura.",
      "• Utilice el número de factura como referencia en la transferencia.",
      "• Para cualquier consulta sobre el pago, contacte directamente con la banda.",
      "• El pago debe realizarse mediante transferencia bancaria.",
    ];

    return this.drawTextList(
      page,
      instructions,
      currentY,
      helveticaFont,
      90,
      pdfDoc,
      height,
    );
  }

  private drawSectionHeader(
    page: any,
    text: string,
    y: number,
    font: any,
    color: any,
  ): void {
    page.drawText(text, {
      x: GenerateInvoiceOnContractSignedEventHandler.MARGIN_LEFT,
      y,
      size: 16,
      font,
      color,
    });
  }

  private drawInfoList(
    page: any,
    infoList: Array<{ label: string; value: string }>,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    secondaryColor: any,
    pdfDoc?: any,
    height?: number,
  ): number {
    let currentPage = page;
    let y = currentY;

    infoList.forEach((info) => {
      if (
        pdfDoc &&
        height &&
        y < GenerateInvoiceOnContractSignedEventHandler.MIN_Y_POSITION
      ) {
        currentPage = pdfDoc.addPage(
          GenerateInvoiceOnContractSignedEventHandler.A4_SIZE,
        );
        y = height - 50;
      }

      currentPage.drawText(info.label, {
        x: GenerateInvoiceOnContractSignedEventHandler.MARGIN_LEFT,
        y,
        size: 11,
        font: helveticaBold,
        color: secondaryColor,
      });
      currentPage.drawText(info.value, {
        x: GenerateInvoiceOnContractSignedEventHandler.MARGIN_RIGHT,
        y,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      y -= 20;
    });

    return y - 20;
  }

  private drawTextList(
    page: any,
    textList: string[],
    currentY: number,
    helveticaFont: any,
    maxWidth: number,
    pdfDoc?: any,
    height?: number,
  ): number {
    let currentPage = page;
    let y = currentY;

    textList.forEach((text) => {
      const lines = this.wrapText(text, maxWidth);
      lines.forEach((line) => {
        if (
          pdfDoc &&
          height &&
          y < GenerateInvoiceOnContractSignedEventHandler.MIN_Y_POSITION
        ) {
          currentPage = pdfDoc.addPage(
            GenerateInvoiceOnContractSignedEventHandler.A4_SIZE,
          );
          y = height - 50;
        }

        currentPage.drawText(line, {
          x: GenerateInvoiceOnContractSignedEventHandler.MARGIN_LEFT,
          y,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        y -= 15;
      });
      y -= 5;
    });

    return y - 20;
  }

  private formatDateTime(date: Date): string {
    return (
      date.toLocaleDateString("es-ES") +
      " " +
      date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      if (testLine.length <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  private checkAndCreateNewPage(
    pdfDoc: any,
    currentPage: any,
    currentY: number,
    height: number,
  ): { page: any; y: number } {
    if (currentY < GenerateInvoiceOnContractSignedEventHandler.MIN_Y_POSITION) {
      const newPage = pdfDoc.addPage(
        GenerateInvoiceOnContractSignedEventHandler.A4_SIZE,
      );
      return { page: newPage, y: height - 50 };
    }
    return { page: currentPage, y: currentY };
  }
}

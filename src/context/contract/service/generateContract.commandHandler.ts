import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GenerateContractCommand } from "./generateContract.command";
import { Injectable } from "@nestjs/common";
import { ContractService } from "./contract.service";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { EXTERNAL_URL } from "../../../config";
import { VidsignerApiWrapper } from "../infrastructure/vidsignerApiWrapper";
import User from "../../shared/domain/user";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { UserNotFoundException } from "../exceptions/userNotFoundException";
import { BandRole } from "../../band/domain/bandRole";
import { Signer } from "../domain/signer";

interface BookingData {
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
  eventTypeId?: string;
}

interface BandData {
  name: string;
  bio?: string;
  price: number;
  bandSize: string;
  technicalRider?: {
    soundSystem: string;
    microphones: string;
    backline: string;
    lighting: string;
    otherRequirements?: string;
  };
  hospitalityRider?: {
    accommodation: string;
    catering: string;
    beverages: string;
    specialRequirements?: string;
  };
  performanceArea?: {
    regions: string[];
    gasPriceCalculation?: any;
    otherComments?: string;
  };
}

interface SignatureCoordinates {
  client: { posX: number; posY: number; page: number };
  band: { posX: number; posY: number; page: number };
}

@Injectable()
@CommandHandler(GenerateContractCommand)
export class GenerateContractCommandHandler
  implements ICommandHandler<GenerateContractCommand>
{
  private static readonly A4_SIZE: [number, number] = [595.28, 841.89];
  private static readonly POINTS_TO_MM = 0.352777778;
  private static readonly MARGIN_LEFT = 50;
  private static readonly MARGIN_RIGHT = 200;
  private static readonly SIGNATURE_OFFSET = 5;

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

    const { pdfBytes, signatureCoordinates } = await this.generatePdfDocument(
      booking,
      band,
      user,
    );
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
          signatureCoordinates.client.page,
          signatureCoordinates.client.posY,
          signatureCoordinates.client.posX,
        ),
        Signer.createDefault(
          bandSignerUser.getFullName(),
          "DNI",
          bandSignerUser.getNationalId(),
          bandSignerUser.getPhoneNumber().replace(/ /g, ""),
          bandSignerUser.getEmail(),
          fileName,
          signatureCoordinates.band.page,
          signatureCoordinates.band.posY,
          signatureCoordinates.band.posX,
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

  private pointsToMillimeters(points: number): number {
    return points * GenerateContractCommandHandler.POINTS_TO_MM;
  }

  private getCurrentPageNumber(pdfDoc: PDFDocument): number {
    return pdfDoc.getPageCount();
  }

  private async generatePdfDocument(
    booking: BookingData,
    band: BandData,
    user: User,
  ): Promise<{
    pdfBytes: Buffer;
    signatureCoordinates: SignatureCoordinates;
  }> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(GenerateContractCommandHandler.A4_SIZE);
    const { height, width } = page.getSize();

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const primaryColor = rgb(0.2, 0.4, 0.8);
    const secondaryColor = rgb(0.3, 0.3, 0.3);
    const accentColor = rgb(0.8, 0.2, 0.2);

    let currentY = height - 50;

    this.drawTitle(page, width, currentY, helveticaBold, primaryColor);
    currentY -= 40;

    this.drawContractInfo(page, currentY, helveticaBold, secondaryColor);
    currentY -= 50;

    currentY = this.drawEventInfo(
      page,
      booking,
      currentY,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
    );
    currentY = this.drawBandInfo(
      page,
      band,
      currentY - 20,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
    );

    if (currentY < 200) {
      page = pdfDoc.addPage(GenerateContractCommandHandler.A4_SIZE);
      currentY = height - 50;
    }

    currentY = this.drawClientInfo(
      page,
      user,
      currentY - 20,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
    );

    currentY = this.drawTermsAndConditions(
      page,
      currentY - 20,
      helveticaBold,
      helveticaFont,
      primaryColor,
    );
    currentY = this.drawCancellationPolicy(
      page,
      currentY,
      helveticaBold,
      helveticaFont,
      accentColor,
    );

    if (currentY < 120) {
      page = pdfDoc.addPage(GenerateContractCommandHandler.A4_SIZE);
      currentY = height - 50;
    }

    const signatureCoordinates = this.drawSignatureSection(
      page,
      currentY,
      helveticaBold,
      helveticaFont,
      primaryColor,
      secondaryColor,
      height,
    );

    const pdfUint8Array = await pdfDoc.save();
    const currentPageNumber = this.getCurrentPageNumber(pdfDoc);

    return {
      pdfBytes: Buffer.from(pdfUint8Array),
      signatureCoordinates: {
        client: {
          posX: Math.round(this.pointsToMillimeters(300)),
          posY: Math.round(
            this.pointsToMillimeters(
              this.convertYCoordinate(signatureCoordinates.client, height),
            ),
          ),
          page: currentPageNumber,
        },
        band: {
          posX: Math.round(this.pointsToMillimeters(50)),
          posY: Math.round(
            this.pointsToMillimeters(
              this.convertYCoordinate(signatureCoordinates.band, height),
            ),
          ),
          page: currentPageNumber,
        },
      },
    };
  }

  private drawTitle(
    page: any,
    width: number,
    y: number,
    font: any,
    color: any,
  ): void {
    page.drawText("CONTRATO DE SERVICIOS MUSICALES", {
      x: width / 2 - 150,
      y,
      size: 18,
      font,
      color,
    });
  }

  private drawContractInfo(page: any, y: number, font: any, color: any): void {
    page.drawText(`Número de Contrato: ${Date.now()}`, {
      x: GenerateContractCommandHandler.MARGIN_LEFT,
      y,
      size: 12,
      font,
      color,
    });

    page.drawText(
      `Fecha de Contrato: ${new Date().toLocaleDateString("es-ES")}`,
      {
        x: 300,
        y,
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
  ): number {
    this.drawSectionHeader(
      page,
      "INFORMACIÓN DEL EVENTO",
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
      { label: "Precio Acordado:", value: `${booking.cost.toFixed(2)} €` },
    ];

    return this.drawInfoList(
      page,
      eventInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
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

    currentY = this.drawInfoList(
      page,
      bandInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
    );

    if (band.bio) {
      currentY = this.drawMultilineText(
        page,
        "Descripción:",
        band.bio,
        currentY,
        helveticaBold,
        helveticaFont,
        secondaryColor,
        80,
      );
    }

    currentY -= 20;

    if (band.technicalRider) {
      currentY = this.drawTechnicalRider(
        page,
        band.technicalRider,
        currentY,
        helveticaBold,
        helveticaFont,
        primaryColor,
        secondaryColor,
      );
    }

    if (band.hospitalityRider) {
      currentY = this.drawHospitalityRider(
        page,
        band.hospitalityRider,
        currentY,
        helveticaBold,
        helveticaFont,
        primaryColor,
        secondaryColor,
      );
    }

    return currentY;
  }

  private drawClientInfo(
    page: any,
    user: User,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
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
    );
  }

  private drawTechnicalRider(
    page: any,
    technicalRider: any,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
  ): number {
    this.drawSectionHeader(
      page,
      "REQUISITOS TÉCNICOS",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 30;

    const technicalInfo = [
      { label: "Sistema de Sonido:", value: technicalRider.soundSystem },
      { label: "Micrófonos:", value: technicalRider.microphones },
      { label: "Backline:", value: technicalRider.backline },
      { label: "Iluminación:", value: technicalRider.lighting },
    ];

    currentY = this.drawInfoList(
      page,
      technicalInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
    );

    if (technicalRider.otherRequirements) {
      currentY = this.drawMultilineText(
        page,
        "Otros Requisitos:",
        technicalRider.otherRequirements,
        currentY,
        helveticaBold,
        helveticaFont,
        secondaryColor,
        80,
      );
    }

    return currentY - 20;
  }

  private drawHospitalityRider(
    page: any,
    hospitalityRider: any,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
  ): number {
    this.drawSectionHeader(
      page,
      "REQUISITOS DE HOSPITALIDAD",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 30;

    const hospitalityInfo = [
      { label: "Alojamiento:", value: hospitalityRider.accommodation },
      { label: "Catering:", value: hospitalityRider.catering },
      { label: "Bebidas:", value: hospitalityRider.beverages },
    ];

    currentY = this.drawInfoList(
      page,
      hospitalityInfo,
      currentY,
      helveticaBold,
      helveticaFont,
      secondaryColor,
    );

    if (hospitalityRider.specialRequirements) {
      currentY = this.drawMultilineText(
        page,
        "Requisitos Especiales:",
        hospitalityRider.specialRequirements,
        currentY,
        helveticaBold,
        helveticaFont,
        secondaryColor,
        80,
      );
    }

    return currentY - 20;
  }

  private drawTermsAndConditions(
    page: any,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
  ): number {
    this.drawSectionHeader(
      page,
      "TÉRMINOS Y CONDICIONES",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 30;

    const terms = [
      "1. La banda se compromete a actuar en el lugar especificado en la fecha y hora acordadas.",
      "2. El cliente se compromete a pagar el importe acordado en su totalidad antes del evento.",
      "3. Cualquier cambio en el acuerdo debe realizarse por escrito y ser acordado por ambas partes.",
      "4. La banda se reserva el derecho de cancelar la actuación en caso de fuerza mayor.",
      "5. El cliente es responsable de proporcionar el equipo y las instalaciones necesarias según los requisitos técnicos especificados.",
      "6. La banda debe llegar al lugar del evento al menos 2 horas antes del inicio para la preparación.",
      "7. El cliente debe proporcionar acceso al lugar del evento para la carga y descarga de equipamiento.",
      "8. En caso de cancelación por parte del cliente, se aplicarán las políticas de cancelación especificadas.",
    ];

    return this.drawTextList(page, terms, currentY, helveticaFont, 90);
  }

  private drawCancellationPolicy(
    page: any,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    accentColor: any,
  ): number {
    this.drawSectionHeader(
      page,
      "POLÍTICA DE CANCELACIÓN",
      currentY,
      helveticaBold,
      accentColor,
    );
    currentY -= 30;

    const cancellationPolicy = [
      "• Cancelación con más de 30 días de antelación: Reembolso del 100% del pago realizado.",
      "• Cancelación entre 15 y 30 días de antelación: Reembolso del 75% del pago realizado.",
      "• Cancelación entre 7 y 14 días de antelación: Reembolso del 50% del pago realizado.",
      "• Cancelación con menos de 7 días de antelación: No hay reembolso.",
      "• En caso de cancelación por parte de la banda por fuerza mayor, se reembolsará el 100% del pago.",
      "• Los reembolsos se procesarán en un plazo máximo de 15 días hábiles.",
    ];

    return this.drawTextList(
      page,
      cancellationPolicy,
      currentY,
      helveticaFont,
      90,
    );
  }

  private drawSignatureSection(
    page: any,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    primaryColor: any,
    secondaryColor: any,
    height: number,
  ): { client: number; band: number } {
    this.drawSectionHeader(
      page,
      "FIRMAS",
      currentY,
      helveticaBold,
      primaryColor,
    );
    currentY -= 40;

    const bandSignatureTextY = currentY;
    const bandSignatureLineY = currentY - 20;
    const clientSignatureTextY = currentY;
    const clientSignatureLineY = currentY - 20;

    page.drawText("Representante de la Banda:", {
      x: GenerateContractCommandHandler.MARGIN_LEFT,
      y: bandSignatureTextY,
      size: 12,
      font: helveticaBold,
      color: secondaryColor,
    });

    page.drawText("_________________________", {
      x: GenerateContractCommandHandler.MARGIN_LEFT,
      y: bandSignatureLineY,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText("Cliente:", {
      x: 300,
      y: clientSignatureTextY,
      size: 12,
      font: helveticaBold,
      color: secondaryColor,
    });

    page.drawText("_________________________", {
      x: 300,
      y: clientSignatureLineY,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    return {
      client:
        clientSignatureLineY - GenerateContractCommandHandler.SIGNATURE_OFFSET,
      band:
        bandSignatureLineY - GenerateContractCommandHandler.SIGNATURE_OFFSET,
    };
  }

  private drawSectionHeader(
    page: any,
    text: string,
    y: number,
    font: any,
    color: any,
  ): void {
    page.drawText(text, {
      x: GenerateContractCommandHandler.MARGIN_LEFT,
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
  ): number {
    infoList.forEach((info) => {
      page.drawText(info.label, {
        x: GenerateContractCommandHandler.MARGIN_LEFT,
        y: currentY,
        size: 11,
        font: helveticaBold,
        color: secondaryColor,
      });
      page.drawText(info.value, {
        x: GenerateContractCommandHandler.MARGIN_RIGHT,
        y: currentY,
        size: 11,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 20;
    });

    return currentY;
  }

  private drawMultilineText(
    page: any,
    label: string,
    text: string,
    currentY: number,
    helveticaBold: any,
    helveticaFont: any,
    secondaryColor: any,
    maxWidth: number,
  ): number {
    page.drawText(label, {
      x: GenerateContractCommandHandler.MARGIN_LEFT,
      y: currentY,
      size: 11,
      font: helveticaBold,
      color: secondaryColor,
    });
    currentY -= 20;

    const lines = this.wrapText(text, maxWidth);
    lines.forEach((line) => {
      page.drawText(line, {
        x: 70,
        y: currentY,
        size: 10,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 15;
    });

    return currentY;
  }

  private drawTextList(
    page: any,
    textList: string[],
    currentY: number,
    helveticaFont: any,
    maxWidth: number,
  ): number {
    textList.forEach((text) => {
      const lines = this.wrapText(text, maxWidth);
      lines.forEach((line) => {
        page.drawText(line, {
          x: GenerateContractCommandHandler.MARGIN_LEFT,
          y: currentY,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
        currentY -= 15;
      });
      currentY -= 5;
    });

    return currentY - 20;
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

  private convertYCoordinate(yInPdf: number, pageHeight: number): number {
    return pageHeight - yInPdf;
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
}

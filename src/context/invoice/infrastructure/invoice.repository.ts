import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Invoice } from "../domain/invoice";
import InvoiceId from "../../shared/domain/invoiceId";
import BookingId from "../../shared/domain/bookingId";
import BandId from "../../shared/domain/bandId";

@Injectable()
export class InvoiceRepository {
  private readonly prisma = new PrismaClient();

  async findById(id: InvoiceId): Promise<Invoice | undefined> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: id.toPrimitive() },
    });

    return invoice ? Invoice.fromPrimitives(invoice) : undefined;
  }

  async findManyByUserId(userId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        contract: {
          booking: {
            userId: userId,
          },
        },
      },
      include: {
        contract: {
          include: {
            booking: true,
          },
        },
      },
    });

    return invoices.map((i) => Invoice.fromPrimitives(i));
  }

  async findManyByBandId(bandId: string): Promise<Invoice[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        contract: {
          booking: {
            bandId: bandId,
          },
        },
      },
      include: {
        contract: {
          include: {
            booking: true,
          },
        },
      },
    });

    return invoices.map((i) => Invoice.fromPrimitives(i));
  }

  async create(invoice: Invoice): Promise<Invoice> {
    const created = await this.prisma.invoice.create({
      data: invoice.toPrimitives(),
    });

    return Invoice.fromPrimitives(created);
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const updated = await this.prisma.invoice.update({
      where: { id: invoice.toPrimitives().id },
      data: invoice.toPrimitives(),
    });

    return updated ? Invoice.fromPrimitives(updated) : undefined;
  }

  async delete(id: InvoiceId): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id: id.toPrimitive() },
    });
  }

  async findBookingUserIdFromInvoiceId(invoiceId: string): Promise<string> {
    const result = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        contract: {
          select: {
            booking: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });
    if (!result) return undefined;

    return result.contract.booking.userId;
  }

  async findBookingBandIdIdFromInvoiceId(invoiceId: string): Promise<string> {
    const result = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: {
        contract: {
          select: {
            booking: {
              select: {
                bandId: true,
              },
            },
          },
        },
      },
    });
    if (!result) return undefined;

    return result.contract.booking.bandId;
  }

  async findByBookingId(bookingId: BookingId) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { contract: { booking: { id: bookingId.toPrimitive() } } },
    });

    return invoice ? Invoice.fromPrimitives(invoice) : undefined;
  }

  async getBookingIdByInvoiceId(invoiceId: InvoiceId): Promise<BookingId> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId.toPrimitive() },
      include: {
        contract: {
          include: {
            booking: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return invoice?.contract?.booking?.id
      ? new BookingId(invoice.contract.booking.id)
      : undefined;
  }

  async getBandIdByInvoiceId(invoiceId: InvoiceId): Promise<BandId> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId.toPrimitive() },
      include: {
        contract: {
          include: {
            booking: {
              select: {
                bandId: true,
              },
            },
          },
        },
      },
    });

    return invoice?.contract?.booking?.bandId
      ? new BandId(invoice.contract.booking.bandId)
      : undefined;
  }
}

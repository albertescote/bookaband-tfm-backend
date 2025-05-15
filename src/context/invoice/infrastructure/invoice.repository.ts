import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Invoice } from "../domain/invoice";
import InvoiceId from "../domain/invoiceId";

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

    return Invoice.fromPrimitives(updated);
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
}

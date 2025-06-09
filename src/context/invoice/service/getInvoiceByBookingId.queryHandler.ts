import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetInvoiceByBookingIdQuery } from "./getInvoiceByBookingId.query";
import BookingId from "../../shared/domain/bookingId";
import { InvoiceRepository } from "../infrastructure/invoice.repository";
import { InvoicePrimitives } from "../domain/invoice";

@Injectable()
@QueryHandler(GetInvoiceByBookingIdQuery)
export class GetInvoiceByBookingIdQueryHandler
  implements IQueryHandler<GetInvoiceByBookingIdQuery>
{
  constructor(private invoiceRepository: InvoiceRepository) {}

  async execute(query: GetInvoiceByBookingIdQuery): Promise<InvoicePrimitives> {
    const contract = await this.invoiceRepository.findByBookingId(
      new BookingId(query.id),
    );
    if (!contract) return undefined;

    return contract.toPrimitives();
  }
}

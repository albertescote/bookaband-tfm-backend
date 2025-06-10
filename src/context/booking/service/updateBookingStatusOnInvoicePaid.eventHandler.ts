import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { BookingRepository } from "../infrastructure/booking.repository";
import { UnableToUpdateBookingException } from "../exceptions/unableToUpdateBookingException";
import { InvoicePaidEvent } from "../../shared/eventBus/domain/invoicePaid.event";
import InvoiceId from "../../shared/domain/invoiceId";
import { BookingNotFoundForInvoiceIdException } from "../exceptions/bookingNotFoundForInvoiceIdException";

@Injectable()
@EventsHandler(InvoicePaidEvent)
export class UpdateBookingStatusOnInvoicePaidEventHandler
  implements IEventHandler<InvoicePaidEvent>
{
  constructor(private bookingRepository: BookingRepository) {}

  async handle(event: InvoicePaidEvent): Promise<void> {
    const { invoiceId } = event;
    const booking = await this.bookingRepository.findByInvoiceId(
      new InvoiceId(invoiceId),
    );
    if (!booking) {
      throw new BookingNotFoundForInvoiceIdException(invoiceId.toString());
    }

    booking.invoicePaid();

    const updated = await this.bookingRepository.save(booking);
    if (!updated) {
      throw new UnableToUpdateBookingException();
    }
  }
}

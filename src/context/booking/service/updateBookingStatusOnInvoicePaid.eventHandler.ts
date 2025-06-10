import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { BookingRepository } from "../infrastructure/booking.repository";
import BookingId from "../../shared/domain/bookingId";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { UnableToUpdateBookingException } from "../exceptions/unableToUpdateBookingException";
import { InvoicePaidEvent } from "../../shared/eventBus/domain/invoicePaid.event";

@Injectable()
@EventsHandler(InvoicePaidEvent)
export class UpdateBookingStatusOnInvoicePaidEventHandler
  implements IEventHandler<InvoicePaidEvent>
{
  constructor(private bookingRepository: BookingRepository) {}

  async handle(event: InvoicePaidEvent): Promise<void> {
    const { bookingId } = event;
    const booking = await this.bookingRepository.findById(
      new BookingId(bookingId),
    );
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    booking.invoicePaid();

    const updated = await this.bookingRepository.save(booking);
    if (!updated) {
      throw new UnableToUpdateBookingException();
    }
  }
}

import { Inject, Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { BookingRepository } from "../infrastructure/booking.repository";
import { UnableToUpdateBookingException } from "../exceptions/unableToUpdateBookingException";
import { InvoicePaidEvent } from "../../shared/eventBus/domain/invoicePaid.event";
import InvoiceId from "../../shared/domain/invoiceId";
import { BookingNotFoundForInvoiceIdException } from "../exceptions/bookingNotFoundForInvoiceIdException";
import { BookingStatusChangedEvent } from "../../shared/eventBus/domain/bookingStatusChanged.event";
import { EventBus } from "../../shared/eventBus/domain/eventBus";

@Injectable()
@EventsHandler(InvoicePaidEvent)
export class UpdateBookingStatusOnInvoicePaidEventHandler
  implements IEventHandler<InvoicePaidEvent>
{
  constructor(
    private bookingRepository: BookingRepository,
    @Inject("EventBus") private eventBus: EventBus,
  ) {}

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

    await this.eventBus.publish(
      new BookingStatusChangedEvent(updated.getId().toPrimitive()),
    );
  }
}

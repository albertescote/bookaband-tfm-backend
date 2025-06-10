import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { BookingRepository } from "../infrastructure/booking.repository";
import BookingId from "../../shared/domain/bookingId";
import { ContractSignedEvent } from "../../shared/eventBus/domain/contractSigned.event";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { UnableToUpdateBookingException } from "../exceptions/unableToUpdateBookingException";

@Injectable()
@EventsHandler(ContractSignedEvent)
export class UpdateBookingStatusOnContractSignedEventHandler
  implements IEventHandler<ContractSignedEvent>
{
  constructor(private bookingRepository: BookingRepository) {}

  async handle(event: ContractSignedEvent): Promise<void> {
    const { bookingId } = event;
    const booking = await this.bookingRepository.findById(
      new BookingId(bookingId),
    );
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }

    booking.contractSigned();

    const updated = await this.bookingRepository.save(booking);
    if (!updated) {
      throw new UnableToUpdateBookingException();
    }
  }
}

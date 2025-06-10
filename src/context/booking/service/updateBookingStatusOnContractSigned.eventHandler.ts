import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { BookingRepository } from "../infrastructure/booking.repository";
import { ContractSignedEvent } from "../../shared/eventBus/domain/contractSigned.event";
import { UnableToUpdateBookingException } from "../exceptions/unableToUpdateBookingException";
import ContractId from "../../shared/domain/contractId";
import { BookingNotFoundForContractIdException } from "../exceptions/bookingNotFoundForContractIdException";

@Injectable()
@EventsHandler(ContractSignedEvent)
export class UpdateBookingStatusOnContractSignedEventHandler
  implements IEventHandler<ContractSignedEvent>
{
  constructor(private bookingRepository: BookingRepository) {}

  async handle(event: ContractSignedEvent): Promise<void> {
    const { contractId } = event;
    const booking = await this.bookingRepository.findByContractId(
      new ContractId(contractId),
    );
    if (!booking) {
      throw new BookingNotFoundForContractIdException(contractId);
    }

    booking.contractSigned();

    const updated = await this.bookingRepository.save(booking);
    if (!updated) {
      throw new UnableToUpdateBookingException();
    }
  }
}

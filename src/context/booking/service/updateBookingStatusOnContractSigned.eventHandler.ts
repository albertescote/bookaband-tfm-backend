import { Inject, Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { BookingRepository } from "../infrastructure/booking.repository";
import { ContractSignedEvent } from "../../shared/eventBus/domain/contractSigned.event";
import { UnableToUpdateBookingException } from "../exceptions/unableToUpdateBookingException";
import ContractId from "../../shared/domain/contractId";
import { BookingNotFoundForContractIdException } from "../exceptions/bookingNotFoundForContractIdException";
import { BookingStatusChangedEvent } from "../../shared/eventBus/domain/bookingStatusChanged.event";
import { EventBus } from "../../shared/eventBus/domain/eventBus";

@Injectable()
@EventsHandler(ContractSignedEvent)
export class UpdateBookingStatusOnContractSignedEventHandler
  implements IEventHandler<ContractSignedEvent>
{
  constructor(
    private bookingRepository: BookingRepository,
    @Inject("EventBus") private eventBus: EventBus,
  ) {}

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

    await this.eventBus.publish(
      new BookingStatusChangedEvent(updated.getId().toPrimitive()),
    );
  }
}

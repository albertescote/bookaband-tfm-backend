import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { BandSignedContractEvent } from "../../shared/eventBus/domain/bandSignedContract.event";

@Injectable()
@EventsHandler(BandSignedContractEvent)
export class CreateBookingNotificationOnBandSignedEventHandler
  implements IEventHandler<BandSignedContractEvent>
{
  private readonly bandSignedTranslationKey = "bandSigned";

  constructor(
    private notificationRepository: NotificationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async handle(event: BandSignedContractEvent): Promise<void> {
    const { bookingId, bandName, userName, eventName } = event;
    const booking = await this.moduleConnectors.getBookingById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }
    const notification = Notification.createBookingNotification(
      new BandId(booking.bandId),
      new UserId(booking.userId),
      {
        bookingId,
        bandName,
        userName,
        eventName,
        status: this.bandSignedTranslationKey,
      },
    );

    await this.notificationRepository.create(notification);
  }
}

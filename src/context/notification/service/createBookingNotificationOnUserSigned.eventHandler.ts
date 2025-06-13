import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { UserSignedContractEvent } from "../../shared/eventBus/domain/userSignedContract.event";

@Injectable()
@EventsHandler(UserSignedContractEvent)
export class CreateBookingNotificationOnUserSignedEventHandler
  implements IEventHandler<UserSignedContractEvent>
{
  private readonly userSignedTranslationKey = "userSigned";

  constructor(
    private notificationRepository: NotificationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async handle(event: UserSignedContractEvent): Promise<void> {
    const { bookingId, userName, bandName, eventName } = event;
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
        status: this.userSignedTranslationKey,
      },
    );

    await this.notificationRepository.create(notification);
  }
}

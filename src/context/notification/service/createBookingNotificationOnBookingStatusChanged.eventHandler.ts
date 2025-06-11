import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { BookingStatusChangedEvent } from "../../shared/eventBus/domain/bookingStatusChanged.event";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";

@Injectable()
@EventsHandler(BookingStatusChangedEvent)
export class CreateBookingNotificationOnBookingStatusChangedEventHandler
  implements IEventHandler<BookingStatusChangedEvent>
{
  constructor(
    private notificationRepository: NotificationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async handle(event: BookingStatusChangedEvent): Promise<void> {
    const { bookingId, status } = event;
    const booking = await this.moduleConnectors.getBookingById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }
    const notification = Notification.createBookingNotification(
      new BandId(booking.bandId),
      new UserId(booking.userId),
      {
        bookingId,
        translationKey: status.toLowerCase(),
      },
    );

    await this.notificationRepository.create(notification);
  }
}

import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { BookingStatusChangedEvent } from "../../shared/eventBus/domain/bookingStatusChanged.event";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { UserNotFoundException } from "../exceptions/userNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";

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
    const { bookingId } = event;
    const booking = await this.moduleConnectors.getBookingById(bookingId);
    if (!booking) {
      throw new BookingNotFoundException(bookingId);
    }
    const user = await this.moduleConnectors.obtainUserInformation(
      booking.userId,
    );
    if (!user) {
      throw new UserNotFoundException(booking.userId);
    }
    const userName = user.getFullName();
    const band = await this.moduleConnectors.getBandById(booking.bandId);
    if (!band) {
      throw new BandNotFoundException(booking.bandId);
    }
    const bandName = band.name;

    const notification = Notification.createBookingNotification(
      new BandId(booking.bandId),
      new UserId(booking.userId),
      {
        bookingId,
        bandName,
        userName,
        eventName: booking.name,
        status: booking.status.toLowerCase(),
      },
    );

    await this.notificationRepository.create(notification);
  }
}

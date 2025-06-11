import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";

import { InvitationStatus } from "../../shared/domain/invitationStatus";
import { InvitationDeclinedEvent } from "../../shared/eventBus/domain/invitationDeclined.event";

@Injectable()
@EventsHandler(InvitationDeclinedEvent)
export class CreateInvitationNotificationOnInvitationDeclinedEventHandler
  implements IEventHandler<InvitationDeclinedEvent>
{
  constructor(private notificationRepository: NotificationRepository) {}

  async handle(event: InvitationDeclinedEvent): Promise<void> {
    const { bandId, userId, userName } = event;

    const notification = Notification.createInvitationNotification(
      new BandId(bandId),
      new UserId(userId),
      {
        status: InvitationStatus.ACCEPTED,
        userName,
      },
    );

    await this.notificationRepository.create(notification);
  }
}

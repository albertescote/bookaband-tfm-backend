import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";

import { InvitationStatus } from "../../shared/domain/invitationStatus";
import { InvitationAcceptedEvent } from "../../shared/eventBus/domain/invitationAccepted.event";

@Injectable()
@EventsHandler(InvitationAcceptedEvent)
export class CreateInvitationNotificationOnInvitationAcceptedEventHandler
  implements IEventHandler<InvitationAcceptedEvent>
{
  constructor(private notificationRepository: NotificationRepository) {}

  async handle(event: InvitationAcceptedEvent): Promise<void> {
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

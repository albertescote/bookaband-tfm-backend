import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";

import { InvitationStatus } from "../../shared/domain/invitationStatus";
import { InvitationSentEvent } from "../../shared/eventBus/domain/invitationSent.event";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";

@Injectable()
@EventsHandler(InvitationSentEvent)
export class CreateInvitationNotificationOnInvitationSentEventHandler
  implements IEventHandler<InvitationSentEvent>
{
  constructor(
    private notificationRepository: NotificationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async handle(event: InvitationSentEvent): Promise<void> {
    const { bandId, userId, userName, createdAt } = event;

    const band = await this.moduleConnectors.getBandById(bandId);
    if (!band) {
      throw new BandNotFoundException(bandId);
    }

    const notification = Notification.createInvitationNotification(
      new BandId(bandId),
      new UserId(userId),
      {
        userName,
        bandName: band.name,
        status: InvitationStatus.PENDING,
        createdAt,
      },
    );

    await this.notificationRepository.create(notification);
  }
}

import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification } from "../domain/notificaiton";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";

import { InvitationStatus } from "../../shared/domain/invitationStatus";
import { InvitationDeclinedEvent } from "../../shared/eventBus/domain/invitationDeclined.event";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";

@Injectable()
@EventsHandler(InvitationDeclinedEvent)
export class CreateInvitationNotificationOnInvitationDeclinedEventHandler
  implements IEventHandler<InvitationDeclinedEvent>
{
  constructor(
    private notificationRepository: NotificationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async handle(event: InvitationDeclinedEvent): Promise<void> {
    const { bandId, userId, userName } = event;

    const band = await this.moduleConnectors.getBandById(bandId);
    if (!band) {
      throw new BandNotFoundException(bandId);
    }

    const notification = Notification.createInvitationNotification(
      new BandId(bandId),
      new UserId(userId),
      {
        status: InvitationStatus.DECLINED,
        bandName: band.name,
        userName,
      },
    );

    await this.notificationRepository.create(notification);
  }
}

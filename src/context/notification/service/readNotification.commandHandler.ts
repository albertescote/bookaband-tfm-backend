import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { ReadNotificationCommand } from "./readNotification.command";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import NotificationId from "../domain/notificationId";
import { NotificationNotFoundException } from "../exceptions/notificationNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { NotAMemberOfTheRequestedBandException } from "../exceptions/notAMemberOfTheRequestedBandException";
import { NotificationPrimitives } from "../domain/notificaiton";

@Injectable()
@CommandHandler(ReadNotificationCommand)
export class ReadNotificationCommandHandler
  implements ICommandHandler<ReadNotificationCommand>
{
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly moduleConnectors: ModuleConnectors,
  ) {}

  async execute(command: ReadNotificationCommand): Promise<void> {
    const { notificationId, authorized } = command;
    const notification = await this.notificationRepository.getById(
      new NotificationId(notificationId),
    );
    if (!notification) {
      throw new NotificationNotFoundException(notificationId);
    }

    const notificationPrimitives = notification.toPrimitives();
    if (authorized.id === notificationPrimitives.userId) {
      notification.markAsReadFromUser();
    } else {
      await this.validateBandMembership(notificationPrimitives, authorized);
      notification.markAsReadFromBand();
    }

    await this.notificationRepository.update(notification);
  }

  private async validateBandMembership(
    notificationPrimitives: NotificationPrimitives,
    authorized: UserAuthInfo,
  ) {
    const bandMembers = await this.moduleConnectors.obtainBandMembers(
      notificationPrimitives.bandId,
    );
    if (!bandMembers) {
      throw new BandNotFoundException(notificationPrimitives.bandId);
    }
    if (!bandMembers.some((memberId) => memberId === authorized.id)) {
      throw new NotAMemberOfTheRequestedBandException(
        notificationPrimitives.id,
      );
    }
  }
}

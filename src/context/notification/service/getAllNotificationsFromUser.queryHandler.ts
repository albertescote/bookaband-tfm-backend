import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllNotificationsFromUserQuery } from "./getAllNotificationsFromUser.query";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification, NotificationPrimitives } from "../domain/notificaiton";
import UserId from "../../shared/domain/userId";
import { Role } from "../../shared/domain/role";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import BandId from "../../shared/domain/bandId";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { InvitationStatus } from "../../shared/domain/invitationStatus";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

interface NotificationsResponse {
  id: string;
  bandId: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
  invitationMetadata?: {
    bandName: string;
    status: InvitationStatus;
    createdAt?: Date;
  };
  bookingMetadata?: {
    bookingId: string;
    status: string;
    eventName: string;
    userName: string;
    bandName: string;
  };
}

@Injectable()
@QueryHandler(GetAllNotificationsFromUserQuery)
export class GetAllNotificationsFromUserQueryHandler
  implements IQueryHandler<GetAllNotificationsFromUserQuery>
{
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly moduleConnectors: ModuleConnectors,
  ) {}

  async execute(
    query: GetAllNotificationsFromUserQuery,
  ): Promise<NotificationsResponse[]> {
    const { authorized, bandId } = query;
    const userId = new UserId(authorized.id);

    const notifications: Notification[] =
      await this.notificationRepository.getAllFromUser(userId);

    if (authorized.role === Role.Musician && bandId) {
      const band = await this.moduleConnectors.getBandById(bandId);
      if (!band) {
        throw new BandNotFoundException(bandId);
      }
      const bandNotifications =
        await this.notificationRepository.getAllFromBandId(new BandId(bandId));

      notifications.push(...bandNotifications);
    }

    const uniqueNotifications =
      this.getUniqueSortedNotifications(notifications);

    return this.shapeNotifications(
      uniqueNotifications.map((n) => n.toPrimitives()),
      authorized,
    );
  }

  private getUniqueSortedNotifications(
    notifications: Notification[],
  ): Notification[] {
    const seen = new Map<string, Notification>();
    notifications.forEach((notification) => {
      const id = notification.getId().toPrimitive();
      if (!seen.has(id)) {
        seen.set(id, notification);
      }
    });

    return Array.from(seen.values()).sort(
      (a, b) => b["createdAt"].getTime() - a["createdAt"].getTime(),
    );
  }

  private shapeNotifications(
    uniqueNotifications: NotificationPrimitives[],
    authorized: UserAuthInfo,
  ): NotificationsResponse[] {
    return uniqueNotifications.map((notification) => {
      let isRead: boolean;
      if (notification.userId === authorized.id) {
        isRead = notification.isReadFromUser;
      } else {
        isRead = notification.isReadFromBand;
      }
      return {
        id: notification.id,
        bandId: notification.bandId,
        userId: notification.userId,
        isRead,
        createdAt: notification.createdAt,
        invitationMetadata: notification.invitationMetadata,
        bookingMetadata: notification.bookingMetadata,
      };
    });
  }
}

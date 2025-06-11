import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllNotificationsFromUserQuery } from "./getAllNotificationsFromUser.query";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { Notification, NotificationPrimitives } from "../domain/notificaiton";
import UserId from "../../shared/domain/userId";
import { Role } from "../../shared/domain/role";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import BandId from "../../shared/domain/bandId";

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
  ): Promise<NotificationPrimitives[]> {
    const { authorized } = query;
    const userId = new UserId(authorized.id);

    const notifications: Notification[] =
      await this.notificationRepository.getAllFromUser(userId);

    if (authorized.role === Role.Musician) {
      const bandIds = await this.moduleConnectors.getUserBands(authorized.id);
      const bandNotifications = await Promise.all(
        bandIds.map((id) =>
          this.notificationRepository.getAllFromBandId(new BandId(id)),
        ),
      );

      bandNotifications.forEach((bandSet) => notifications.push(...bandSet));
    }

    const uniqueNotifications =
      this.getUniqueSortedNotifications(notifications);

    return uniqueNotifications.map((n) => n.toPrimitives());
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
}

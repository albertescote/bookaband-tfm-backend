import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllNotificationsFromUserQuery } from "./getAllNotificationsFromUser.query";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { NotificationPrimitives } from "../domain/notificaiton";
import UserId from "../../shared/domain/userId";

@Injectable()
@QueryHandler(GetAllNotificationsFromUserQuery)
export class GetAllNotificationsFromUserQueryHandler
  implements IQueryHandler<GetAllNotificationsFromUserQuery>
{
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(
    query: GetAllNotificationsFromUserQuery,
  ): Promise<NotificationPrimitives[]> {
    const notifications = await this.notificationRepository.getAllFromUser(
      new UserId(query.authorized.id),
    );
    return notifications.map((notification) => notification.toPrimitives());
  }
}

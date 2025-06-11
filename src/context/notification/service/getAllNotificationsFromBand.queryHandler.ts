import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { NotificationRepository } from "../infrastructure/notifications.repository";
import { NotificationPrimitives } from "../domain/notificaiton";
import { GetAllNotificationsFromBandQuery } from "./getAllNotificationsFromBand.query";
import BandId from "../../shared/domain/bandId";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotAMemberOfTheRequestedBandException } from "../exceptions/notAMemberOfTheRequestedBandException";

@Injectable()
@QueryHandler(GetAllNotificationsFromBandQuery)
export class GetAllNotificationsFromBandQueryHandler
  implements IQueryHandler<GetAllNotificationsFromBandQuery>
{
  constructor(
    private notificationRepository: NotificationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async execute(
    query: GetAllNotificationsFromBandQuery,
  ): Promise<NotificationPrimitives[]> {
    const { bandId, authorized } = query;

    const bandMembersId = await this.moduleConnectors.obtainBandMembers(bandId);
    if (!bandMembersId.some((memberId) => memberId === authorized.id)) {
      throw new NotAMemberOfTheRequestedBandException(bandId);
    }

    const notifications = await this.notificationRepository.getAllFromBandId(
      new BandId(bandId),
    );
    return notifications.map((notification) => notification.toPrimitives());
  }
}

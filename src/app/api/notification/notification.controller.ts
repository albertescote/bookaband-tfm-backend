import { Controller, Get, HttpCode, Request, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetAllNotificationsFromUserQuery } from "../../../context/notification/service/getAllNotificationsFromUser.query";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";

import { InvitationStatus } from "../../../context/shared/domain/invitationStatus";

interface NotificationsResponse {
  id: string;
  bandId: string;
  userId: string;
  isRead: boolean;
  invitationMetadata?: {
    bandName: string;
    status: InvitationStatus;
    createdAt?: Date;
  };
  bookingMetadata?: {
    bookingId: string;
    translationKey: string;
  };
}

@Controller("/notifications")
export class NotificationController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("/user")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getAllFromUser(
    @Request() req: { user: UserAuthInfo },
  ): Promise<NotificationsResponse[]> {
    const query = new GetAllNotificationsFromUserQuery(req.user);
    return this.queryBus.execute(query);
  }
}

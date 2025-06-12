import {
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { GetAllNotificationsFromUserQuery } from "../../../context/notification/service/getAllNotificationsFromUser.query";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";

import { InvitationStatus } from "../../../context/shared/domain/invitationStatus";
import { SanitizeTextPipe } from "../../pipes/sanitize-text.pipe";
import { ReadNotificationCommand } from "../../../context/notification/service/readNotification.command";

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
    translationKey: string;
  };
}

@Controller("/notifications")
export class NotificationController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get("/user")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getAllFromUser(
    @Request() req: { user: UserAuthInfo },
    @Query("bandId", SanitizeTextPipe) bandId: string,
  ): Promise<NotificationsResponse[]> {
    const query = new GetAllNotificationsFromUserQuery(req.user, bandId);
    return this.queryBus.execute(query);
  }

  @Put("/:id/read")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async readNotification(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<NotificationsResponse[]> {
    const command = new ReadNotificationCommand(req.user, id);
    return this.commandBus.execute(command);
  }
}

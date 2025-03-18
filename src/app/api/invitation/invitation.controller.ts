import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { InvitationService } from "../../../context/invitation/service/invitation.service";
import { InvitationResponseDto } from "./invitationResponse.dto";
import { SendInvitationRequestDto } from "./sendInvitationRequest.dto";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";

@Controller("/invitations")
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Post("/send")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async sendInvitation(
    @Body() body: SendInvitationRequestDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<InvitationResponseDto> {
    return await this.invitationService.sendInvitation(
      req.user,
      body.bandId,
      body.userEmail,
    );
  }

  @Put("/:id/accept")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async acceptInvitation(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<InvitationResponseDto> {
    return await this.invitationService.acceptInvitation(req.user, id);
  }

  @Put("/:id/decline")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async declineInvitation(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<InvitationResponseDto> {
    return await this.invitationService.declineInvitation(req.user, id);
  }

  @Get()
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getUserInvitations(
    @Request() req: { user: UserAuthInfo },
  ): Promise<InvitationResponseDto[]> {
    return await this.invitationService.getUserInvitations(req.user);
  }
}

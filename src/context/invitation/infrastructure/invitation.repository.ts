import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Invitation, { InvitationStatus } from "../domain/invitation";
import InvitationId from "../domain/invitationId";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { UserInvitation } from "../domain/userInvitation";

@Injectable()
export class InvitationRepository {
  constructor(private prismaService: PrismaService) {}

  async save(invitation: Invitation): Promise<Invitation> {
    const storedInvitation = await this.prismaService.invitation.upsert({
      where: { id: invitation.toPrimitives().id },
      update: invitation.toPrimitives(),
      create: invitation.toPrimitives(),
    });

    return storedInvitation
      ? Invitation.fromPrimitives({
          id: storedInvitation.id,
          bandId: storedInvitation.bandId,
          userId: storedInvitation.userId,
          status: InvitationStatus[storedInvitation.status],
          createdAt: storedInvitation.createdAt,
        })
      : undefined;
  }

  async findById(invitationId: InvitationId): Promise<Invitation> {
    const invitation = await this.prismaService.invitation.findFirst({
      where: { id: invitationId.toPrimitive() },
    });
    return invitation
      ? Invitation.fromPrimitives({
          id: invitation.id,
          bandId: invitation.bandId,
          userId: invitation.userId,
          status: InvitationStatus[invitation.status],
          createdAt: invitation.createdAt,
        })
      : undefined;
  }

  async findPendingInvitationByBandAndUser(
    bandId: BandId,
    userId: UserId,
  ): Promise<Invitation> {
    const invitation = await this.prismaService.invitation.findFirst({
      where: {
        bandId: bandId.toPrimitive(),
        userId: userId.toPrimitive(),
        status: InvitationStatus.PENDING,
      },
    });
    return invitation
      ? Invitation.fromPrimitives({
          id: invitation.id,
          bandId: invitation.bandId,
          userId: invitation.userId,
          status: InvitationStatus[invitation.status],
          createdAt: invitation.createdAt,
        })
      : undefined;
  }
  async findByUser(userId: UserId): Promise<UserInvitation[]> {
    const invitations = await this.prismaService.invitation.findMany({
      where: { userId: userId.toPrimitive() },
      include: {
        band: true,
      },
    });
    return invitations && invitations.length > 0
      ? invitations.map((invitation) => {
          return {
            id: invitation.id,
            bandId: invitation.bandId,
            bandName: invitation.band.name,
            userId: invitation.userId,
            status: InvitationStatus[invitation.status],
            createdAt: invitation.createdAt,
          };
        })
      : [];
  }
}

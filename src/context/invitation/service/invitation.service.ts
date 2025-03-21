import { Injectable } from "@nestjs/common";
import { InvitationRepository } from "../infrastructure/invitation.repository";
import Invitation, { InvitationPrimitives } from "../domain/invitation";
import InvitationId from "../domain/invitationId";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { InvitationNotFoundException } from "../exception/invitationNotFoundException";
import { InvitationAlreadyProcessedException } from "../exception/invitationAlreadyProcessedException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { NotOwnerOfTheRequestedBandException } from "../exception/notOwnerOfTheRequestedBandException";
import { NotOwnerOfTheRequestedInvitationException } from "../exception/notOwnerOfTheRequestedInvitationException";
import { UserEmailNotFoundException } from "../exception/userEmailNotFoundException";
import { InvitationAlreadySentException } from "../exception/invitationAlreadySentException";
import { AlreadyMemberOfThisBandException } from "../exception/alreadyMemberOfThisBandException";
import { Role } from "../../shared/domain/role";
import { UserIsNotMusicianException } from "../exception/userIsNotMusicianException";
import { UserInvitation } from "../domain/userInvitation";

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async sendInvitation(
    userAuthInfo: UserAuthInfo,
    bandId: string,
    userEmail: string,
  ): Promise<InvitationPrimitives> {
    const bandMembers = await this.moduleConnectors.obtainBandMembers(bandId);
    const member = bandMembers.find(
      (bandMember) => bandMember === userAuthInfo.id,
    );
    if (!member) {
      throw new NotOwnerOfTheRequestedBandException(bandId);
    }
    const user = await this.moduleConnectors.obtainUserInformation(
      undefined,
      userEmail,
    );
    if (!user) {
      throw new UserEmailNotFoundException(userEmail);
    }
    if (user.getRole() !== Role.Musician) {
      throw new UserIsNotMusicianException();
    }
    const existingMember = bandMembers.find(
      (member) => member === user.getId().toPrimitive(),
    );
    if (existingMember) {
      throw new AlreadyMemberOfThisBandException(bandId);
    }
    const existingInvitation =
      await this.invitationRepository.findPendingInvitationByBandAndUser(
        new BandId(bandId),
        user.getId(),
      );
    if (existingInvitation) {
      throw new InvitationAlreadySentException(
        user.getId().toPrimitive(),
        bandId,
      );
    }
    const invitation = Invitation.create(
      new BandId(bandId),
      new UserId(user.getId().toPrimitive()),
    );
    const storedInvitation = await this.invitationRepository.save(invitation);
    return storedInvitation.toPrimitives();
  }

  async acceptInvitation(
    userAuthInfo: UserAuthInfo,
    invitationId: string,
  ): Promise<InvitationPrimitives> {
    const invitation = await this.invitationRepository.findById(
      new InvitationId(invitationId),
    );

    if (!invitation) {
      throw new InvitationNotFoundException(invitationId);
    }

    if (!invitation.isOwner(userAuthInfo.id)) {
      throw new NotOwnerOfTheRequestedInvitationException(invitationId);
    }

    if (!invitation.isPending()) {
      throw new InvitationAlreadyProcessedException();
    }

    invitation.accept();
    await this.invitationRepository.save(invitation);

    const invitationPrimitives = invitation.toPrimitives();
    await this.moduleConnectors.joinBand(
      invitationPrimitives.bandId,
      invitationPrimitives.userId,
    );

    return invitationPrimitives;
  }

  async declineInvitation(
    userAuthInfo: UserAuthInfo,
    invitationId: string,
  ): Promise<InvitationPrimitives> {
    const invitation = await this.invitationRepository.findById(
      new InvitationId(invitationId),
    );

    if (!invitation) {
      throw new InvitationNotFoundException(invitationId);
    }

    if (!invitation.isOwner(userAuthInfo.id)) {
      throw new NotOwnerOfTheRequestedInvitationException(invitationId);
    }

    if (!invitation.isPending()) {
      throw new InvitationAlreadyProcessedException();
    }

    invitation.decline();
    await this.invitationRepository.save(invitation);

    return invitation.toPrimitives();
  }

  async getUserInvitations(
    userAuthInfo: UserAuthInfo,
  ): Promise<UserInvitation[]> {
    return this.invitationRepository.findByUser(new UserId(userAuthInfo.id));
  }
}

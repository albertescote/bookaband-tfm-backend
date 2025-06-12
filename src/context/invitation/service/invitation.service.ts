import { Inject, Injectable } from "@nestjs/common";
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
import { UserInvitation } from "../domain/userInvitation";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { MissingUserInfoToJoinBandException } from "../exception/missingUserInfoToJoinBandException";
import { UserNotFoundException } from "../exception/userNotFoundException";
import { EventBus } from "../../shared/eventBus/domain/eventBus";
import { InvitationSentEvent } from "../../shared/eventBus/domain/invitationSent.event";
import { InvitationAcceptedEvent } from "../../shared/eventBus/domain/invitationAccepted.event";
import { InvitationDeclinedEvent } from "../../shared/eventBus/domain/invitationDeclined.event";

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly moduleConnectors: ModuleConnectors,
    @Inject("EventBus") private readonly eventBus: EventBus,
  ) {}

  @RoleAuth([Role.Musician])
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

    const invitationPrimitives = storedInvitation.toPrimitives();
    await this.eventBus.publish(
      new InvitationSentEvent(
        invitationPrimitives.bandId,
        invitationPrimitives.userId,
        user.getFullName(),
        invitationPrimitives.createdAt,
      ),
    );

    return invitationPrimitives;
  }

  @RoleAuth([Role.Musician])
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

    const user = await this.moduleConnectors.obtainUserInformation(
      userAuthInfo.id,
    );
    if (!user) {
      throw new UserNotFoundException(userAuthInfo.id);
    }
    if (!user.hasAllInfo()) {
      throw new MissingUserInfoToJoinBandException();
    }

    invitation.accept();
    await this.invitationRepository.save(invitation);

    const invitationPrimitives = invitation.toPrimitives();
    await this.moduleConnectors.joinBand(
      invitationPrimitives.bandId,
      invitationPrimitives.userId,
    );

    await this.eventBus.publish(
      new InvitationAcceptedEvent(
        invitationPrimitives.bandId,
        invitationPrimitives.userId,
        user.getFullName(),
      ),
    );

    return invitationPrimitives;
  }

  @RoleAuth([Role.Musician])
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

    const invitationPrimitives = invitation.toPrimitives();

    const user = await this.moduleConnectors.obtainUserInformation(
      userAuthInfo.id,
    );
    if (!user) {
      throw new UserNotFoundException(userAuthInfo.id);
    }

    await this.eventBus.publish(
      new InvitationDeclinedEvent(
        invitationPrimitives.bandId,
        invitationPrimitives.userId,
        user.getFullName(),
      ),
    );

    return invitationPrimitives;
  }

  @RoleAuth([Role.Musician])
  async getUserInvitations(
    userAuthInfo: UserAuthInfo,
  ): Promise<UserInvitation[]> {
    return this.invitationRepository.findByUser(new UserId(userAuthInfo.id));
  }
}

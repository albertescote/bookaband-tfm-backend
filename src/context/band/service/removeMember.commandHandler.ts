import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import BandId from "../../shared/domain/bandId";
import { RemoveMemberCommand } from "./removeMember.command";
import UserId from "../../shared/domain/userId";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import Band from "../domain/band";
import { FailedToUpdateBandAfterLeavingException } from "../exceptions/failedToUpdateBandAfterLeavingException";
import { BandRole } from "../domain/bandRole";

@Injectable()
@CommandHandler(RemoveMemberCommand)
export class RemoveMemberCommandHandler
  implements ICommandHandler<RemoveMemberCommand>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(command: RemoveMemberCommand): Promise<void> {
    const band = await this.bandRepository.getBandById(
      new BandId(command.bandId),
    );
    if (!band) {
      throw new BandNotFoundException(command.bandId);
    }

    const bandPrimitives = band.toPrimitives();
    const admin = bandPrimitives.members.find((m) => m.id === command.userId);
    if (!admin) {
      throw new WrongPermissionsException(
        "remove member - user is not a member",
      );
    }

    if (admin.role !== BandRole.ADMIN) {
      throw new WrongPermissionsException(
        "remove member - only admins can remove members",
      );
    }

    const memberToRemove = bandPrimitives.members.find(
      (m) => m.id === command.memberToRemoveId,
    );
    if (!memberToRemove) {
      throw new WrongPermissionsException(
        "remove member - member to remove not found",
      );
    }

    if (memberToRemove.role === BandRole.ADMIN) {
      const adminCount = bandPrimitives.members.filter(
        (m) => m.role === BandRole.ADMIN,
      ).length;
      if (adminCount === 1) {
        throw new WrongPermissionsException(
          "remove member - cannot remove the last admin",
        );
      }
    }

    const updatedMembers = bandPrimitives.members.filter(
      (m) => m.id !== command.memberToRemoveId,
    );

    const updatedBand = await this.bandRepository.updateBand(
      new Band(
        new BandId(command.bandId),
        bandPrimitives.name,
        updatedMembers.map((m) => ({ id: new UserId(m.id), role: m.role })),
        bandPrimitives.genre,
        bandPrimitives.reviewCount,
        bandPrimitives.followers,
        bandPrimitives.following,
        bandPrimitives.createdAt,
        bandPrimitives.imageUrl,
        bandPrimitives.rating,
        bandPrimitives.bio,
      ),
    );

    if (!updatedBand) {
      throw new FailedToUpdateBandAfterLeavingException(command.bandId);
    }
  }
}

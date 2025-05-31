import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import BandId from "../../shared/domain/bandId";
import { LeaveBandCommand } from "./leaveBand.command";
import UserId from "../../shared/domain/userId";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import Band from "../domain/band";
import { FailedToUpdateBandAfterLeavingException } from "../exceptions/failedToUpdateBandAfterLeavingException";
import { BandRole } from "../domain/bandRole";

@Injectable()
@CommandHandler(LeaveBandCommand)
export class LeaveBandCommandHandler
  implements ICommandHandler<LeaveBandCommand>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(command: LeaveBandCommand): Promise<void> {
    const band = await this.bandRepository.getBandById(
      new BandId(command.bandId),
    );
    if (!band) {
      throw new BandNotFoundException(command.bandId);
    }

    const bandPrimitives = band.toPrimitives();
    const member = bandPrimitives.members.find((m) => m.id === command.userId);
    if (!member) {
      throw new WrongPermissionsException("leave band - user is not a member");
    }

    if (member.role === BandRole.ADMIN) {
      const adminCount = bandPrimitives.members.filter(
        (m) => m.role === BandRole.ADMIN,
      ).length;
      if (adminCount === 1) {
        throw new WrongPermissionsException(
          "leave band - cannot leave as the last admin. Please assign another admin first.",
        );
      }
    }

    const updatedMembers = bandPrimitives.members.filter(
      (m) => m.id !== command.userId,
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

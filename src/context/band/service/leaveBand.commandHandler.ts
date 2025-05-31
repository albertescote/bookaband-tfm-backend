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
    if (!bandPrimitives.membersId.includes(command.userId)) {
      throw new WrongPermissionsException("leave band");
    }

    const updatedMembersId = bandPrimitives.membersId.filter(
      (id) => id !== command.userId,
    );

    const updatedBand = await this.bandRepository.updateBand(
      new Band(
        new BandId(command.bandId),
        bandPrimitives.name,
        updatedMembersId.map((id) => new UserId(id)),
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

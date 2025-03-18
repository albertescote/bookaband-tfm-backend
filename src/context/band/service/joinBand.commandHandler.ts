import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import BandId from "../../shared/domain/bandId";
import { JoinBandCommand } from "./joinBand.command";
import UserId from "../../shared/domain/userId";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";

@Injectable()
@CommandHandler(JoinBandCommand)
export class JoinBandCommandHandler
  implements ICommandHandler<JoinBandCommand>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(command: JoinBandCommand): Promise<void> {
    const band = await this.bandRepository.getBandById(
      new BandId(command.bandId),
    );
    if (!band) {
      throw new BandNotFoundException(command.bandId);
    }
    band.addMember(new UserId(command.userId));
    await this.bandRepository.updateBand(band);
  }
}

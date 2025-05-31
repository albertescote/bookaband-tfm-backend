import { Injectable } from "@nestjs/common";
import { ICommandHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import { LeaveBandCommand } from "./leaveBand.command";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import Band from "../domain/band";
import BandId from "../../shared/domain/bandId";
import UserId from "../../shared/domain/userId";
import { UserIsNotMemberOfBandException } from "../exceptions/userIsNotMemberOfBandException";
import { AdminCannotLeaveBandException } from "../exceptions/adminCannotLeaveBandException";
import { BandRole } from "../domain/bandRole";

@Injectable()
export class LeaveBandCommandHandler implements ICommandHandler<LeaveBandCommand> {
  constructor(private readonly bandRepository: BandRepository) {}

  async execute(command: LeaveBandCommand): Promise<void> {
    const band = await this.bandRepository.getBandById(new BandId(command.bandId));

    if (!band) {
      throw new BandNotFoundException(command.bandId);
    }

    const members = band.toPrimitives().members;

    const userIsMember = members.some(
      (member) => member.id === command.userId,
    );

    if (!userIsMember) {
      throw new UserIsNotMemberOfBandException(command.userId, command.bandId);
    }

    const userIsAdmin = members.some(
      (member) => member.id === command.userId && member.role === BandRole.ADMIN,
    );

    if (userIsAdmin) {
      throw new AdminCannotLeaveBandException(command.userId, command.bandId);
    }

    band.removeMember(new UserId(command.userId));
    await this.bandRepository.updateBand(band);
  }
}

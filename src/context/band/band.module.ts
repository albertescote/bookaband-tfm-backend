import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BandService } from "./service/band.service";
import { GetBandMembersQueryHandler } from "./service/getBandMembers.queryHandler";
import { BandRepository } from "./infrastructure/band.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { GetBandInfoQueryHandler } from "./service/getBandInfo.queryHandler";
import { JoinBandCommandHandler } from "./service/joinBand.commandHandler";
import { LeaveBandCommandHandler } from "./service/leaveBand.commandHandler";
import { RemoveMemberCommandHandler } from "./service/removeMember.commandHandler";

@Module({
  imports: [CqrsModule],
  providers: [
    BandService,
    GetBandMembersQueryHandler,
    GetBandInfoQueryHandler,
    JoinBandCommandHandler,
    LeaveBandCommandHandler,
    RemoveMemberCommandHandler,
    BandRepository,
    ModuleConnectors,
    PrismaService,
  ],
  exports: [
    BandService,
    GetBandMembersQueryHandler,
    GetBandInfoQueryHandler,
    JoinBandCommandHandler,
    LeaveBandCommandHandler,
    RemoveMemberCommandHandler,
  ],
})
export class BandModule {}

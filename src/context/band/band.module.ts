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
import { GetFeaturedBandsQueryHandler } from "./service/getFeaturedBands.queryHandler";
import { GetFilteredBandsQueryHandler } from "./service/getFilteredBands.queryHandler";
import { GetBandProfileQueryHandler } from "./service/getBandProfile.queryHandler";
import { GetUserBandsQueryHandler } from "./service/getUserBands.queryHandler";
import { LocationRegionChecker } from "./infrastructure/locationRegionChecker";

@Module({
  imports: [CqrsModule],
  providers: [
    BandService,
    GetBandMembersQueryHandler,
    GetBandInfoQueryHandler,
    JoinBandCommandHandler,
    LeaveBandCommandHandler,
    RemoveMemberCommandHandler,
    GetFilteredBandsQueryHandler,
    GetFeaturedBandsQueryHandler,
    GetBandProfileQueryHandler,
    GetUserBandsQueryHandler,
    BandRepository,
    ModuleConnectors,
    PrismaService,
    LocationRegionChecker,
  ],
  exports: [
    BandService,
    GetBandMembersQueryHandler,
    GetBandInfoQueryHandler,
    JoinBandCommandHandler,
    LeaveBandCommandHandler,
    RemoveMemberCommandHandler,
    GetFilteredBandsQueryHandler,
    GetFeaturedBandsQueryHandler,
    GetBandProfileQueryHandler,
    GetUserBandsQueryHandler,
  ],
})
export class BandModule {}

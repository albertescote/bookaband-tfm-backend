import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { BandService } from "./service/band.service";
import { GetBandMembersQueryHandler } from "./service/getBandMembers.queryHandler";
import { BandRepository } from "./infrastructure/band.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import PrismaService from "../shared/infrastructure/db/prisma.service";

@Module({
  imports: [CqrsModule],
  providers: [
    BandService,
    GetBandMembersQueryHandler,
    BandRepository,
    ModuleConnectors,
    PrismaService,
  ],
  exports: [BandService, GetBandMembersQueryHandler],
})
export class BandModule {}

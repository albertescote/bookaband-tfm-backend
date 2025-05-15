import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ContractService } from "./service/contract.service";
import { ContractRepository } from "./infrastructure/contract.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { GetBookingIdByContractIdQueryHandler } from "./service/getBookingIdByContractId.queryHandler";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
  imports: [CqrsModule],
  providers: [
    ModuleConnectors,
    ContractService,
    ContractRepository,
    PrismaService,
    GetBookingIdByContractIdQueryHandler,
  ],
  exports: [ContractService, GetBookingIdByContractIdQueryHandler],
})
export class ContractModule {}

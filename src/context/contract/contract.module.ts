import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ContractService } from "./service/contract.service";
import { ContractRepository } from "./infrastructure/contract.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { GetContractByBookingIdQueryHandler } from "./service/getContractByBookingId.queryHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { GenerateContractCommandHandler } from "./service/generateContract.commandHandler";
import { VidsignerApiWrapper } from "./infrastructure/vidsignerApiWrapper";

@Module({
  imports: [CqrsModule],
  providers: [
    ModuleConnectors,
    ContractService,
    ContractRepository,
    PrismaService,
    GetContractByBookingIdQueryHandler,
    GenerateContractCommandHandler,
    VidsignerApiWrapper,
  ],
  exports: [
    ContractService,
    GetContractByBookingIdQueryHandler,
    GenerateContractCommandHandler,
  ],
})
export class ContractModule {}

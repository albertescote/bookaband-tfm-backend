import { Inject, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ContractService } from "./service/contract.service";
import { ContractRepository } from "./infrastructure/contract.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { GetContractByBookingIdQueryHandler } from "./service/getContractByBookingId.queryHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { GenerateContractCommandHandler } from "./service/generateContract.commandHandler";
import { VidsignerApiWrapper } from "./infrastructure/vidsignerApiWrapper";
import { ProcessSignatureNotificationCommandHandler } from "./service/processSignatureNotification.commandHandler";
import { EventBusModule } from "../shared/eventBus/eventBus.module";
import { BUS_TYPE } from "../../config";
import { ModuleRef } from "@nestjs/core";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { EventBus } from "../shared/eventBus/domain/eventBus";
import EventsBusEventRegisterer from "../shared/eventBus/infrastructure/eventsBusEventRegisterer";

@Module({
  imports: [
    CqrsModule,
    EventBusModule.register({
      ...{ type: BUS_TYPE },
      module: "contract",
    }),
  ],
  providers: [
    ModuleConnectors,
    ContractService,
    ContractRepository,
    PrismaService,
    GetContractByBookingIdQueryHandler,
    GenerateContractCommandHandler,
    VidsignerApiWrapper,
    ProcessSignatureNotificationCommandHandler,
    ExplorerService,
  ],
  exports: [
    ContractService,
    GetContractByBookingIdQueryHandler,
    GenerateContractCommandHandler,
    ProcessSignatureNotificationCommandHandler,
  ],
})
export class ContractModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private moduleRef: ModuleRef,
    private readonly explorer: ExplorerService,
    @Inject("EventBus") private readonly eventBus: EventBus,
  ) {}
  async onModuleInit() {
    const eventBusStarter = new EventsBusEventRegisterer(
      this.moduleRef,
      this.explorer,
      this.eventBus,
    );
    await eventBusStarter.registerEvents();
  }

  async onModuleDestroy() {
    await this.eventBus.stop();
  }
}

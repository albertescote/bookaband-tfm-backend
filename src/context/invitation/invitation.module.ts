import { Inject, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { InvitationService } from "./service/invitation.service";
import { InvitationRepository } from "./infrastructure/invitation.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { CqrsModule } from "@nestjs/cqrs";
import { ModuleRef } from "@nestjs/core";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { EventBus } from "../shared/eventBus/domain/eventBus";
import EventsBusEventRegisterer from "../shared/eventBus/infrastructure/eventsBusEventRegisterer";
import { EventBusModule } from "../shared/eventBus/eventBus.module";
import { BUS_TYPE } from "../../config";

@Module({
  imports: [
    CqrsModule,
    EventBusModule.register({
      ...{ type: BUS_TYPE },
      module: "invitation",
    }),
  ],
  providers: [
    InvitationService,
    InvitationRepository,
    PrismaService,
    ModuleConnectors,
    ExplorerService,
  ],
  exports: [InvitationService],
})
export class InvitationModule implements OnModuleInit, OnModuleDestroy {
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

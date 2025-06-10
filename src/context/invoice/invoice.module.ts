import { Inject, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { InvoiceService } from "./service/invoice.service";
import { InvoiceRepository } from "./infrastructure/invoice.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { GetInvoiceByBookingIdQueryHandler } from "./service/getInvoiceByBookingId.queryHandler";
import { EventBusModule } from "../shared/eventBus/eventBus.module";
import { BUS_TYPE } from "../../config";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { ModuleRef } from "@nestjs/core";
import { EventBus } from "../shared/eventBus/domain/eventBus";
import EventsBusEventRegisterer from "../shared/eventBus/infrastructure/eventsBusEventRegisterer";

@Module({
  imports: [
    CqrsModule,
    EventBusModule.register({
      ...{ type: BUS_TYPE },
      module: "invoice",
    }),
  ],
  providers: [
    ModuleConnectors,
    InvoiceService,
    InvoiceRepository,
    PrismaService,
    GetInvoiceByBookingIdQueryHandler,
    ExplorerService,
  ],
  exports: [InvoiceService, GetInvoiceByBookingIdQueryHandler],
})
export class InvoiceModule implements OnModuleInit, OnModuleDestroy {
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

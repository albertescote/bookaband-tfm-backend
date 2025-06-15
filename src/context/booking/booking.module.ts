import { Inject, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { BookingService } from "./service/booking.service";
import { BookingRepository } from "./infrastructure/booking.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { CqrsModule } from "@nestjs/cqrs";
import { GetUserIdByBookingIdQueryHandler } from "./service/getUserIdByBookingId.queryHandler";
import { GetBookingByIdQueryHandler } from "./service/getBookingById.queryHandler";
import { GetBookingByContractIdQueryHandler } from "./service/getBookingByContractId.queryHandler";
import { GetBookingPriceQueryHandler } from "./service/getBookingPrice.queryHandler";
import { UpdateBookingStatusOnContractSignedEventHandler } from "./service/updateBookingStatusOnContractSigned.eventHandler";
import { UpdateBookingStatusOnInvoicePaidEventHandler } from "./service/updateBookingStatusOnInvoicePaid.eventHandler";
import { EventBusModule } from "../shared/eventBus/eventBus.module";
import { BUS_TYPE, RESEND_API_KEY } from "../../config";
import { ModuleRef } from "@nestjs/core";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { EventBus } from "../shared/eventBus/domain/eventBus";
import EventsBusEventRegisterer from "../shared/eventBus/infrastructure/eventsBusEventRegisterer";
import { GasPriceCalculator } from "./infrastructure/gasPriceCalculator";

const GoogleMapsApiKey = {
  provide: "google-maps-api-key",
  useFactory: () => {
    return RESEND_API_KEY;
  },
};

@Module({
  imports: [
    CqrsModule,
    EventBusModule.register({
      ...{ type: BUS_TYPE },
      module: "invitation",
    }),
  ],
  providers: [
    BookingService,
    BookingRepository,
    PrismaService,
    ModuleConnectors,
    GetUserIdByBookingIdQueryHandler,
    GetBookingByIdQueryHandler,
    GetBookingByContractIdQueryHandler,
    GetBookingPriceQueryHandler,
    UpdateBookingStatusOnContractSignedEventHandler,
    UpdateBookingStatusOnInvoicePaidEventHandler,
    ExplorerService,
    GasPriceCalculator,
  ],
  exports: [
    BookingService,
    GetUserIdByBookingIdQueryHandler,
    GetBookingByIdQueryHandler,
    GetBookingByContractIdQueryHandler,
    GetBookingPriceQueryHandler,
    UpdateBookingStatusOnContractSignedEventHandler,
    UpdateBookingStatusOnInvoicePaidEventHandler,
  ],
})
export class BookingModule implements OnModuleInit, OnModuleDestroy {
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

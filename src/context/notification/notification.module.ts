import { Inject, Module, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import MongoCollectionService from "../shared/infrastructure/db/mongoCollection.service";
import { GetAllNotificationsFromUserQueryHandler } from "./service/getAllNotificationsFromUser.queryHandler";
import MongoService from "../shared/infrastructure/db/mongo.service";
import { MongoClient } from "mongodb";
import { BUS_TYPE, MONGO_DB_URL } from "../../config";
import { NotificationRepository } from "./infrastructure/notifications.repository";
import { CqrsModule } from "@nestjs/cqrs";
import { EventBusModule } from "../shared/eventBus/eventBus.module";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { ModuleRef } from "@nestjs/core";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { EventBus } from "../shared/eventBus/domain/eventBus";
import EventsBusEventRegisterer from "../shared/eventBus/infrastructure/eventsBusEventRegisterer";
import { CreateBookingNotificationOnBandSignedEventHandler } from "./service/createBookingNotificationOnBandSigned.eventHandler";
import { CreateBookingNotificationOnUserSignedEventHandler } from "./service/createBookingNotificationOnUserSigned.eventHandler";
import { CreateBookingNotificationOnBookingStatusChangedEventHandler } from "./service/createBookingNotificationOnBookingStatusChanged.eventHandler";
import { CreateInvitationNotificationOnInvitationSentEventHandler } from "./service/createInvitationNotificationOnInvitationSent.eventHandler";
import { CreateInvitationNotificationOnInvitationDeclinedEventHandler } from "./service/createInvitationNotificationOnInvitationDeclined.eventHandler";
import { CreateInvitationNotificationOnInvitationAcceptedEventHandler } from "./service/createInvitationNotificationOnInvitationAccepted.eventHandler";
import { ReadNotificationCommandHandler } from "./service/readNotification.commandHandler";

const mongoClient = {
  provide: MongoClient,
  useFactory: async () => {
    return new MongoClient(MONGO_DB_URL);
  },
};

@Module({
  imports: [
    CqrsModule,
    EventBusModule.register({
      ...{ type: BUS_TYPE },
      module: "notification",
    }),
  ],
  providers: [
    ModuleConnectors,
    mongoClient,
    MongoService,
    MongoCollectionService,
    NotificationRepository,
    GetAllNotificationsFromUserQueryHandler,
    CreateBookingNotificationOnBookingStatusChangedEventHandler,
    CreateBookingNotificationOnUserSignedEventHandler,
    CreateBookingNotificationOnBandSignedEventHandler,
    CreateInvitationNotificationOnInvitationSentEventHandler,
    CreateInvitationNotificationOnInvitationAcceptedEventHandler,
    CreateInvitationNotificationOnInvitationDeclinedEventHandler,
    ExplorerService,
    ReadNotificationCommandHandler,
  ],
  exports: [
    GetAllNotificationsFromUserQueryHandler,
    CreateBookingNotificationOnBookingStatusChangedEventHandler,
    CreateBookingNotificationOnUserSignedEventHandler,
    CreateBookingNotificationOnBandSignedEventHandler,
    CreateInvitationNotificationOnInvitationSentEventHandler,
    CreateInvitationNotificationOnInvitationAcceptedEventHandler,
    CreateInvitationNotificationOnInvitationDeclinedEventHandler,
    ReadNotificationCommandHandler,
  ],
})
export class NotificationModule implements OnModuleInit, OnModuleDestroy {
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

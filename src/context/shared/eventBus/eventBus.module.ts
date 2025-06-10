import { DynamicModule } from "@nestjs/common";
import { EventBus as CqrsEventBus } from "@nestjs/cqrs/dist/event-bus";
import { ModuleRef } from "@nestjs/core";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import InMemoryAsyncEventBus from "./infrastructure/inMemoryAsyncEventBus";
import { CqrsModule } from "@nestjs/cqrs";

const EventBusProvider = {
  provide: "EventBus",
  useFactory: (
    cqrsEventBus: CqrsEventBus,
    moduleRef: ModuleRef,
    explorer: ExplorerService,
    options: Record<string, any>,
  ) => {
    if (options.type === "INMEMORY_ASYNC") {
      return new InMemoryAsyncEventBus(cqrsEventBus, explorer, moduleRef);
    }
  },
  inject: [CqrsEventBus, ModuleRef, ExplorerService, "CONFIG_OPTIONS"],
};

export class EventBusModule {
  static register(options: Record<string, any>): DynamicModule {
    return {
      module: EventBusModule,
      imports: [CqrsModule],
      controllers: [],
      providers: [
        {
          provide: "CONFIG_OPTIONS",
          useValue: options,
        },
        EventBusProvider,
        ExplorerService,
      ],
      exports: [EventBusProvider],
    };
  }
}

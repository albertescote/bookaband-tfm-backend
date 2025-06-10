import { ModuleRef } from "@nestjs/core";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { EventBus } from "../domain/eventBus";

export default class EventsBusEventRegisterer {
  constructor(
    private moduleRef: ModuleRef,
    private readonly explorer: ExplorerService,
    private eventBus: EventBus,
  ) {}

  async registerEvents(): Promise<void> {
    const { events } = this.explorer.explore();
    events.map((event) => {
      const eventNames = this.extractEventNamesFromEventHandler(event);
      try {
        const instance = this.moduleRef.get(event);
        eventNames.map((eventName) => {
          Reflect.defineMetadata("event:name", eventName, instance);
          this.eventBus.addSubscribers([instance], eventName);
        });
      } catch (error) {}
    });
    await this.eventBus.start();
  }
  private extractEventNamesFromEventHandler(eventHandler: any): string[] {
    const eventNames = [];
    Reflect.getMetadataKeys(eventHandler).map((key) => {
      if ((key as string).indexOf("eventsHandler") > -1) {
        Reflect.getMetadata(key, eventHandler).map((eventHandlerMetadata) => {
          eventNames.push(eventHandlerMetadata.name);
        });
      }
    });
    return eventNames;
  }
}

import { EventBus as CqrsEventBus } from "@nestjs/cqrs/dist/event-bus";
import { BaseEvent } from "../domain/baseEvent";
import { IEventHandler } from "@nestjs/cqrs";
import { ExplorerService } from "@nestjs/cqrs/dist/services/explorer.service";
import { ModuleRef } from "@nestjs/core";
import { Injectable } from "@nestjs/common";
import { EventBus } from "../domain/eventBus";

@Injectable()
export default class InMemoryAsyncEventBus implements EventBus {
  constructor(
    private readonly cqrsEventBus: CqrsEventBus,
    private readonly explorer: ExplorerService,
    private moduleRef: ModuleRef,
  ) {}
  addSubscribers(subscribers: Array<IEventHandler<BaseEvent>>): void {}

  async publish(event: BaseEvent): Promise<void> {
    await this.cqrsEventBus.publish(event);
  }

  async start(): Promise<void> {
    const { events } = this.explorer.explore();
    events.forEach(this.wrapWithTryCatch.bind(this));
  }

  stop(): Promise<void> {
    return Promise.resolve(undefined);
  }

  private wrapWithTryCatch(handler): void {
    let instance = undefined;
    try {
      instance = this.moduleRef.get(handler, { strict: false });
    } catch {}
    if (!instance) {
      return;
    }
    const methodRef = instance.handle;
    instance.handle = async (event) => {
      try {
        await methodRef.bind(instance).call(handler, event);
      } catch (e) {
        console.error({
          method: `${InMemoryAsyncEventBus.name}.${handler.name}`,
          customError: e,
          payload: { handler: handler.name, event },
          message: `Event error: ${e} Handler: ${handler.name} EventId: ${event.id}`,
        });
      }
    };
  }
}

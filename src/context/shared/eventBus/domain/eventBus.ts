import { IEventHandler } from "@nestjs/cqrs";
import { BaseEvent } from "./baseEvent";

export interface EventBus {
  publish(events: BaseEvent): Promise<void>;
  addSubscribers(
    subscribers: Array<IEventHandler<BaseEvent>>,
    eventName: string,
  ): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

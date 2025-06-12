import { BaseEvent } from "./baseEvent";

export class BookingStatusChangedEvent extends BaseEvent {
  constructor(private _bookingId: string) {
    super();
  }

  get bookingId(): string {
    return this._bookingId;
  }
}

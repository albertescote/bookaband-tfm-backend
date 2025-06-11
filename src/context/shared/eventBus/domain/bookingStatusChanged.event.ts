import { BaseEvent } from "./baseEvent";
import { BookingStatus } from "../../domain/bookingStatus";

export class BookingStatusChangedEvent extends BaseEvent {
  constructor(
    private _bookingId: string,
    private _status: BookingStatus,
  ) {
    super();
  }

  get bookingId(): string {
    return this._bookingId;
  }

  get status(): BookingStatus {
    return this._status;
  }
}

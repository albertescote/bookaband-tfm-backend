import { BaseEvent } from "./baseEvent";

export class UserSignedContractEvent extends BaseEvent {
  constructor(private _bookingId: string) {
    super();
  }

  get bookingId(): string {
    return this._bookingId;
  }
}

import { BaseEvent } from "./baseEvent";

export class UserSignedContractEvent extends BaseEvent {
  constructor(
    private _bookingId: string,
    private _userName: string,
    private _bandName: string,
    private _eventName: string,
  ) {
    super();
  }

  get eventName(): string {
    return this._eventName;
  }

  get userName(): string {
    return this._userName;
  }

  get bandName(): string {
    return this._bandName;
  }

  get bookingId(): string {
    return this._bookingId;
  }
}

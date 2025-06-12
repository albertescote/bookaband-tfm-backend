import { BaseEvent } from "./baseEvent";

export class BandSignedContractEvent extends BaseEvent {
  constructor(
    private _bookingId: string,
    private _userName: string,
    private _bandName: string,
    private _eventName: string,
  ) {
    super();
  }

  get userName(): string {
    return this._userName;
  }

  get bandName(): string {
    return this._bandName;
  }

  get eventName(): string {
    return this._eventName;
  }

  get bookingId(): string {
    return this._bookingId;
  }
}

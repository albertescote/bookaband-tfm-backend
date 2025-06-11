import { BaseEvent } from "./baseEvent";

export class InvitationAcceptedEvent extends BaseEvent {
  constructor(
    private _bandId: string,
    private _userId: string,
    private _userName: string,
  ) {
    super();
  }

  get bandId(): string {
    return this._bandId;
  }

  get userId(): string {
    return this._userId;
  }

  get userName(): string {
    return this._userName;
  }
}

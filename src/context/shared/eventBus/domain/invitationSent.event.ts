import { BaseEvent } from "./baseEvent";

export class InvitationSentEvent extends BaseEvent {
  constructor(
    private _bandId: string,
    private _userId: string,
    private _userName: string,
    private _createdAt: Date,
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

  get createdAt(): Date {
    return this._createdAt;
  }
}

export class AddBookingIntoChatCommand {
  constructor(
    private _userId: string,
    private _bandId: string,
    private _bookingId: string,
  ) {}

  get userId(): string {
    return this._userId;
  }

  get bandId(): string {
    return this._bandId;
  }

  get bookingId(): string {
    return this._bookingId;
  }
}

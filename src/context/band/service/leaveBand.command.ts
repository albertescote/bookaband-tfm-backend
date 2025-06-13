export class LeaveBandCommand {
  constructor(
    private _bandId: string,
    private _userId: string,
  ) {}

  get bandId(): string {
    return this._bandId;
  }

  get userId(): string {
    return this._userId;
  }
}

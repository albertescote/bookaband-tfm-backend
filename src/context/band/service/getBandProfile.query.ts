export class GetBandProfileQuery {
  constructor(
    private _userId: string,
    private _id: string,
  ) {}

  get userId(): string {
    return this._userId;
  }

  get id(): string {
    return this._id;
  }
}

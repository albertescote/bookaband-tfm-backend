export class GetResetPasswordSessionQuery {
  constructor(private _id: string) {}

  get id(): string {
    return this._id;
  }
}

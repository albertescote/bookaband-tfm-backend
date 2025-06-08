export class GetBookingByIdQuery {
  constructor(public _id: string) {}

  get id(): string {
    return this._id;
  }
}

import { AuthorizedCommand } from "../../shared/domain/authorizedCommand";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

export class CreateArtistReviewCommand implements AuthorizedCommand {
  constructor(
    private _bookingId: string,
    private _rating: number,
    private _comment: string,
    private _authorized: UserAuthInfo,
  ) {}

  get bookingId(): string {
    return this._bookingId;
  }

  get rating(): number {
    return this._rating;
  }

  get comment(): string {
    return this._comment;
  }

  get authorized(): UserAuthInfo {
    return this._authorized;
  }
}

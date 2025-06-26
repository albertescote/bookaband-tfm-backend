import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { AuthorizedQuery } from "../../shared/domain/authorizedQuery";

export class GetReviewByBookingIdQuery implements AuthorizedQuery {
  constructor(
    private readonly _bookingId: string,
    private readonly _authorized: UserAuthInfo,
  ) {}

  get bookingId(): string {
    return this._bookingId;
  }

  get authorized(): UserAuthInfo {
    return this._authorized;
  }
}

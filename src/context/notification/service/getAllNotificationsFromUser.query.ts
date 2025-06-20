import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

export class GetAllNotificationsFromUserQuery {
  constructor(
    private _authorized: UserAuthInfo,
    private _bandId: string,
  ) {}

  get bandId(): string {
    return this._bandId;
  }

  get authorized(): UserAuthInfo {
    return this._authorized;
  }
}

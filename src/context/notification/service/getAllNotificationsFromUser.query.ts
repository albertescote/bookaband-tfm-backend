import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

export class GetAllNotificationsFromUserQuery {
  constructor(private _authorized: UserAuthInfo) {}

  get authorized(): UserAuthInfo {
    return this._authorized;
  }
}

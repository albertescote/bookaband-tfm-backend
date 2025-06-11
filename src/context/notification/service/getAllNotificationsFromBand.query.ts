import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

export class GetAllNotificationsFromBandQuery {
  constructor(
    private _bandId: string,
    private _authorized: UserAuthInfo,
  ) {}

  get bandId(): string {
    return this._bandId;
  }

  get authorized(): UserAuthInfo {
    return this._authorized;
  }
}

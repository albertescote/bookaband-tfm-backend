import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

export class ReadNotificationCommand {
  constructor(
    private _authorized: UserAuthInfo,
    private _notificationId: string,
  ) {}

  get notificationId(): string {
    return this._notificationId;
  }

  get authorized(): UserAuthInfo {
    return this._authorized;
  }
}

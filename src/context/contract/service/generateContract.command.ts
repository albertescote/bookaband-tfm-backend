import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

export class GenerateContractCommand {
  constructor(
    private _bookingId: string,
    private _bandId: string,
    private _authorized: UserAuthInfo,
  ) {}

  get bookingId(): string {
    return this._bookingId;
  }

  get bandId(): string {
    return this._bandId;
  }

  get authorized(): UserAuthInfo {
    return this._authorized;
  }
}

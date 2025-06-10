import { UserAuthInfo } from "../../shared/domain/userAuthInfo";

export class PayInvoiceCommand {
  constructor(
    private _id: string,
    private _authorized: UserAuthInfo,
  ) {}

  get authorized(): UserAuthInfo {
    return this._authorized;
  }

  get id(): string {
    return this._id;
  }
}

import { Languages } from "../../shared/domain/languages";

export class SendResetPasswordEmailCommand {
  constructor(
    private _userId: string,
    private _email: string,
    private _lng: Languages,
  ) {}

  get userId(): string {
    return this._userId;
  }

  get email(): string {
    return this._email;
  }

  get lng(): Languages {
    return this._lng;
  }
}

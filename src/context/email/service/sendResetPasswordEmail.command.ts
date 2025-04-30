import { Languages } from "../../shared/domain/languages";

export class SendResetPasswordEmailCommand {
  constructor(
    private _email: string,
    private _lng: Languages,
  ) {}

  get email(): string {
    return this._email;
  }

  get lng(): Languages {
    return this._lng;
  }
}

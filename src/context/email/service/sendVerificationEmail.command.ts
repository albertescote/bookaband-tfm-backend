import { Languages } from "../../shared/domain/languages";

export class SendVerificationEmailCommand {
  constructor(
    private _email: string,
    private _userId: string,
    private _lng: Languages,
  ) {}

  get email(): string {
    return this._email;
  }

  get userId(): string {
    return this._userId;
  }

  get lng(): Languages {
    return this._lng;
  }
}

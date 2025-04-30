export class ResendVerificationEmailCommand {
  constructor(private _userId: string) {}

  get userId(): string {
    return this._userId;
  }
}

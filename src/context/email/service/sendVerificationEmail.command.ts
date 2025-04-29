export class SendVerificationEmailCommand {
  constructor(
    private _to: string,
    private _token: string,
  ) {}

  get to(): string {
    return this._to;
  }

  get token(): string {
    return this._token;
  }
}

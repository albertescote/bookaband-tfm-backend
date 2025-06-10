import { BaseEvent } from "./baseEvent";

export class InvoicePaidEvent extends BaseEvent {
  constructor(private _invoiceId: string) {
    super();
  }

  get invoiceId(): string {
    return this._invoiceId;
  }
}

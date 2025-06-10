import { BaseEvent } from "./baseEvent";

export class ContractSignedEvent extends BaseEvent {
  constructor(private _contractId: string) {
    super();
  }

  get contractId(): string {
    return this._contractId;
  }
}

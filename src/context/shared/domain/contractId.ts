import { v4 as uuidv4, validate } from "uuid";
import { InvalidContractIdFormatException } from "../../contract/exceptions/invalidContractIdFormatException";

export default class ContractId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidContractIdFormatException(value);
    }
  }

  static generate(): ContractId {
    return new ContractId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}

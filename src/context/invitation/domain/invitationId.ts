import { v4 as uuidv4, validate } from "uuid";
import { InvalidInvitationIdFormatException } from "../exception/invalidInvitationIdFormatException";

export default class InvitationId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidInvitationIdFormatException(value);
    }
  }

  static generate(): InvitationId {
    return new InvitationId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}

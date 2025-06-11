import { v4 as uuidv4 } from "uuid";

export default class NotificationId {
  constructor(private readonly value: string) {}

  static generate(): NotificationId {
    return new NotificationId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}

import { v4 as uuidv4 } from "uuid";

export default class MusicalStyleId {
  constructor(private readonly value: string) {}

  static generate(): MusicalStyleId {
    return new MusicalStyleId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
} 
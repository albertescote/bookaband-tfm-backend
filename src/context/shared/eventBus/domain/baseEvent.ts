import { v4 as uuidv4 } from "uuid";

export class BaseEvent {
  id: string;
  timestamp: Date;
  constructor() {
    this.id = uuidv4().toString();
    this.timestamp = new Date();
  }
}

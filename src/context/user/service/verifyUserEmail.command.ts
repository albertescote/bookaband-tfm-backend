import UserId from "../../shared/domain/userId";

export class VerifyUserEmailCommand {
  constructor(public readonly userId: UserId) {}
} 
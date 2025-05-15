import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailVerification } from "../domain/emailVerification";
import UserId from "../../shared/domain/userId";
import { EmailVerificationRepository } from "../infrastructure/emailVerification.repository";
import { NotAbleToExecuteEmailVerificationDbTransactionException } from "../exceptions/notAbleToExecuteEmailVerificationDbTransactionException";
import { CreateVerificationRecordCommand } from "./createVerificationRecord.command";

@Injectable()
@CommandHandler(CreateVerificationRecordCommand)
export class CreateVerificationRecordCommandHandler
  implements ICommandHandler<CreateVerificationRecordCommand>
{
  constructor(
    private emailVerificationRepository: EmailVerificationRepository,
  ) {}

  async execute(command: CreateVerificationRecordCommand): Promise<void> {
    const { email, userId, lng, verified } = command;
    const emailVerification = EmailVerification.create(
      new UserId(userId),
      lng,
      email,
    );
    if (verified) emailVerification.verifyEmail();

    const storedEmailVerification =
      await this.emailVerificationRepository.createVerificationRecord(
        emailVerification,
      );
    if (!storedEmailVerification) {
      throw new NotAbleToExecuteEmailVerificationDbTransactionException(
        `create verification record`,
      );
    }
  }
}

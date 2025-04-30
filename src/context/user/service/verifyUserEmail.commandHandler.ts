import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UserRepository } from "../infrastructure/user.repository";
import { VerifyUserEmailCommand } from "./verifyUserEmail.command";
import { UserNotFoundException } from "../exception/userNotFoundException";
import User from "../../shared/domain/user";
import { NotAbleToVerifyUserEmailException } from "../exception/notAbleToVerifyUserEmailException";

@CommandHandler(VerifyUserEmailCommand)
export class VerifyUserEmailCommandHandler
  implements ICommandHandler<VerifyUserEmailCommand>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: VerifyUserEmailCommand): Promise<void> {
    const user = await this.userRepository.getUserById(command.userId);

    if (!user) {
      throw new UserNotFoundException(command.userId.toString());
    }
    user.verifyEmail();
    const userPrimitives = user.toPrimitives();
    const updatedUser = await this.userRepository.updateUser(
      command.userId,
      User.fromPrimitives(userPrimitives),
    );

    if (!updatedUser) {
      throw new NotAbleToVerifyUserEmailException();
    }
  }
}

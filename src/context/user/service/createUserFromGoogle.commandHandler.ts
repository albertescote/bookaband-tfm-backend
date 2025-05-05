import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CreateUserFromGoogleCommand } from "./createUserFromGoogle.command";
import { Role } from "../../shared/domain/role";
import { InvalidRoleException } from "../../shared/exceptions/invalidRoleException";
import User from "../../shared/domain/user";
import UserId from "../../shared/domain/userId";
import { NotAbleToExecuteUserDbTransactionException } from "../exception/notAbleToExecuteUserDbTransactionException";
import { UserRepository } from "../infrastructure/user.repository";

@Injectable()
@CommandHandler(CreateUserFromGoogleCommand)
export class CreateUserFromGoogleCommandHandler
  implements ICommandHandler<CreateUserFromGoogleCommand>
{
  constructor(private userRepository: UserRepository) {}

  async execute(command: CreateUserFromGoogleCommand): Promise<void> {
    const role = Role[command.role];
    if (!role) {
      throw new InvalidRoleException(command.role);
    }
    const user = new User(
      UserId.generate(),
      command.firstName,
      command.familyName,
      command.email,
      role,
      true,
      undefined,
      command.imageUrl,
    );

    const storedUser = await this.userRepository.addUser(user);
    if (!storedUser) {
      throw new NotAbleToExecuteUserDbTransactionException(`store user`);
    }
  }
}

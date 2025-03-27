import { Injectable } from "@nestjs/common";
import User from "../../shared/domain/user";
import UserId from "../../shared/domain/userId";
import { UserRepository } from "../infrastructure/user.repository";
import { PasswordService } from "../../shared/utils/password.service";
import { Role } from "../../shared/domain/role";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { UserNotFoundException } from "../exception/userNotFoundException";
import { WrongPermissionsException } from "../exception/wrongPermissionsException";
import { EmailAlreadyExistsException } from "../exception/emailAlreadyExistsException";
import { NotAbleToExecuteUserDbTransactionException } from "../exception/notAbleToExecuteUserDbTransactionException";
import { InvalidRoleException } from "../../shared/exceptions/invalidRoleException";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";

export interface CreateUserRequest {
  firstName: string;
  familyName: string;
  email: string;
  password: string;
  role: string;
  imageUrl?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  familyName: string;
  email: string;
  role: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  role: string;
  imageUrl?: string;
}

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
  ) {}

  async create(request: CreateUserRequest): Promise<UserResponse> {
    const encryptedPassword = await this.passwordService.hashPassword(
      request.password,
    );
    const role = Role[request.role];
    if (!role) {
      throw new InvalidRoleException(request.role);
    }
    await this.checkExistingEmail(request.email);
    const user = new User(
      UserId.generate(),
      request.firstName,
      request.familyName,
      request.email,
      encryptedPassword,
      role,
      request.imageUrl,
    );
    const storedUser = await this.userRepository.addUser(user);
    if (!storedUser) {
      throw new NotAbleToExecuteUserDbTransactionException(`store user`);
    }
    const userPrimitives = storedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
      imageUrl: userPrimitives.imageUrl,
    };
  }

  @RoleAuth([Role.Musician, Role.Client])
  async getById(userAuthInfo: UserAuthInfo, id: string): Promise<UserResponse> {
    const storedUser = await this.userRepository.getUserById(new UserId(id));
    if (!storedUser) {
      throw new UserNotFoundException(id);
    }
    const userPrimitives = storedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
      imageUrl: userPrimitives.imageUrl,
    };
  }

  @RoleAuth([Role.Musician, Role.Client])
  async getAll(_: UserAuthInfo): Promise<UserResponse[]> {
    const users = await this.userRepository.getAllUsers();
    return users.map((user) => {
      const userPrimitives = user.toPrimitives();
      return {
        id: userPrimitives.id,
        firstName: userPrimitives.firstName,
        familyName: userPrimitives.familyName,
        email: userPrimitives.email,
        role: userPrimitives.role,
        imageUrl: userPrimitives.imageUrl,
      };
    });
  }

  @RoleAuth([Role.Musician, Role.Client])
  async update(
    userAuthInfo: UserAuthInfo,
    id: string,
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const oldUser = await this.userRepository.getUserById(new UserId(id));
    if (!oldUser) {
      throw new UserNotFoundException(id);
    }
    if (oldUser.toPrimitives().id !== userAuthInfo.id) {
      throw new WrongPermissionsException("update user");
    }
    if (oldUser.toPrimitives().email !== request.email) {
      await this.checkExistingEmail(request.email);
    }
    const updatedUser = await this.userRepository.updateUser(
      new UserId(id),
      User.fromPrimitives({
        ...request,
        id,
        password: oldUser.toPrimitives().password,
      }),
    );
    if (!updatedUser) {
      throw new NotAbleToExecuteUserDbTransactionException(
        `update user (${id})`,
      );
    }
    const userPrimitives = updatedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
      imageUrl: userPrimitives.imageUrl,
    };
  }

  @RoleAuth([Role.Musician, Role.Client])
  async deleteById(userAuthInfo: UserAuthInfo, id: string): Promise<void> {
    const oldUser = await this.userRepository.getUserById(new UserId(id));
    if (!oldUser) {
      throw new UserNotFoundException(id);
    }
    if (oldUser.toPrimitives().id !== userAuthInfo.id) {
      throw new WrongPermissionsException("delete user");
    }
    const deleted = await this.userRepository.deleteUser(new UserId(id));
    if (!deleted) {
      throw new NotAbleToExecuteUserDbTransactionException(
        `delete user (${id})`,
      );
    }
    return;
  }

  private async checkExistingEmail(email: string): Promise<void> {
    const existingUserWithSameEmail =
      await this.userRepository.getUserByEmail(email);
    if (!!existingUserWithSameEmail) {
      throw new EmailAlreadyExistsException(email);
    }
  }
}

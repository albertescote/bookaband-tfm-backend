import { Injectable } from "@nestjs/common";
import User from "../../shared/domain/user";
import UserId from "../../shared/domain/userId";
import { UserRepository } from "../infrastructure/user.repository";
import { PasswordService } from "../../shared/utils/password.service";
import { Role } from "../../shared/domain/role";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { UserNotFoundException } from "../exception/userNotFoundException";
import { EmailAlreadyExistsException } from "../exception/emailAlreadyExistsException";
import { NotAbleToExecuteUserDbTransactionException } from "../exception/notAbleToExecuteUserDbTransactionException";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { PasswordNotSecureException } from "../exception/passwordNotSecureException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { Languages } from "../../shared/domain/languages";
import { InvalidRoleException } from "../../shared/exceptions/invalidRoleException";
import { UserProfileDetails } from "../domain/userProfileDetails";

export interface CreateUserRequest {
  firstName: string;
  familyName: string;
  email: string;
  password: string;
  role: Role;
  imageUrl?: string;
  lng?: Languages;
  bio?: string;
}

export interface UpdateUserRequest {
  firstName: string;
  familyName: string;
  bio?: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  imageUrl?: string;
  bio?: string;
}

export interface ResetPasswordRequest {
  email: string;
  lng?: Languages;
}

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async create(request: CreateUserRequest): Promise<UserResponse> {
    if (!this.passwordService.isPasswordSecure(request.password)) {
      throw new PasswordNotSecureException();
    }
    const encryptedPassword = await this.passwordService.hashPassword(
      request.password,
    );
    const role = Role[request.role];
    if (!role) {
      throw new InvalidRoleException(request.role);
    }
    await this.checkExistingEmail(request.email);
    const user = User.create(
      request.firstName,
      request.familyName,
      request.email,
      request.role,
      encryptedPassword,
      request.imageUrl,
      request.bio,
    );

    const storedUser = await this.userRepository.addUser(user);
    if (!storedUser) {
      throw new NotAbleToExecuteUserDbTransactionException(`store user`);
    }

    try {
      await this.moduleConnectors.sendVerificationEmail(
        user.getId().toPrimitive(),
        request.email,
        request.lng ?? Languages.ENGLISH,
      );
    } catch (e) {
      await this.userRepository.deleteUser(user.getId());
      throw e;
    }

    const userPrimitives = storedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
      emailVerified: userPrimitives.emailVerified,
      imageUrl: userPrimitives.imageUrl,
    };
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
  async getById(userAuthInfo: UserAuthInfo): Promise<UserResponse> {
    const storedUser = await this.userRepository.getUserById(
      new UserId(userAuthInfo.id),
    );
    if (!storedUser) {
      throw new UserNotFoundException(userAuthInfo.id);
    }
    const userPrimitives = storedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
      emailVerified: userPrimitives.emailVerified,
      imageUrl: userPrimitives.imageUrl,
    };
  }

  @RoleAuth([Role.Client])
  async getUserProfileDetails(
    userAuthInfo: UserAuthInfo,
  ): Promise<UserProfileDetails> {
    const userProfileDetails = await this.userRepository.getUserProfileDetails(
      new UserId(userAuthInfo.id),
    );
    if (!userProfileDetails) {
      throw new UserNotFoundException(userAuthInfo.id);
    }
    return userProfileDetails;
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
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
        emailVerified: userPrimitives.emailVerified,
        imageUrl: userPrimitives.imageUrl,
      };
    });
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
  async update(
    userAuthInfo: UserAuthInfo,
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const oldUser = await this.userRepository.getUserById(
      new UserId(userAuthInfo.id),
    );
    if (!oldUser) {
      throw new UserNotFoundException(userAuthInfo.id);
    }
    const oldUserPrimitives = oldUser.toPrimitives();
    const updatedUser = await this.userRepository.updateUser(
      new UserId(userAuthInfo.id),
      User.fromPrimitives({
        ...request,
        id: userAuthInfo.id,
        emailVerified: oldUserPrimitives.emailVerified,
        role: oldUserPrimitives.role,
        password: oldUserPrimitives.password,
        email: oldUserPrimitives.email,
        joinedDate: oldUserPrimitives.joinedDate,
      }),
    );
    if (!updatedUser) {
      throw new NotAbleToExecuteUserDbTransactionException(
        `update user (${userAuthInfo.id})`,
      );
    }
    const userPrimitives = updatedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
      emailVerified: userPrimitives.emailVerified,
      imageUrl: userPrimitives.imageUrl,
    };
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
  async deleteById(userAuthInfo: UserAuthInfo): Promise<void> {
    const oldUser = await this.userRepository.getUserById(
      new UserId(userAuthInfo.id),
    );
    if (!oldUser) {
      throw new UserNotFoundException(userAuthInfo.id);
    }
    const deleted = await this.userRepository.deleteUser(
      new UserId(userAuthInfo.id),
    );
    if (!deleted) {
      throw new NotAbleToExecuteUserDbTransactionException(
        `delete user (${userAuthInfo.id})`,
      );
    }
    return;
  }

  async requestResetPassword(resetPasswordRequestDto: ResetPasswordRequest) {
    const user = await this.userRepository.getUserByEmail(
      resetPasswordRequestDto.email,
    );
    if (!user || !user.isEmailVerified() || !user.hasPassword()) {
      // Silently fail
      return;
    }

    await this.moduleConnectors.sendResetPasswordEmail(
      user.getId().toPrimitive(),
      user.toPrimitives().email,
      resetPasswordRequestDto.lng,
    );
  }

  async updatePassword(
    userAuthInfo: UserAuthInfo,
    password: string,
  ): Promise<void> {
    const user = await this.userRepository.getUserById(
      new UserId(userAuthInfo.id),
    );
    if (!user) {
      throw new UserNotFoundException(userAuthInfo.id);
    }
    if (!this.passwordService.isPasswordSecure(password)) {
      throw new PasswordNotSecureException();
    }
    const encryptedPassword = await this.passwordService.hashPassword(password);

    user.resetPassword(encryptedPassword);

    const updatedUser = await this.userRepository.updateUser(
      user.getId(),
      user,
    );
    if (!updatedUser) {
      throw new NotAbleToExecuteUserDbTransactionException(
        `update user (${userAuthInfo.id})`,
      );
    }
  }

  private async checkExistingEmail(email: string): Promise<void> {
    const existingUserWithSameEmail =
      await this.userRepository.getUserByEmail(email);
    if (!!existingUserWithSameEmail) {
      throw new EmailAlreadyExistsException(email);
    }
  }
}

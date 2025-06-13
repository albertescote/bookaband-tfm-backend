import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "../../../../src/context/user/service/user.service";
import { UserRepository } from "../../../../src/context/user/infrastructure/user.repository";
import { PasswordService } from "../../../../src/context/shared/infrastructure/password.service";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { Role } from "../../../../src/context/shared/domain/role";
import { Languages } from "../../../../src/context/shared/domain/languages";
import User from "../../../../src/context/shared/domain/user";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { UserNotFoundException } from "../../../../src/context/user/exception/userNotFoundException";
import { EmailAlreadyExistsException } from "../../../../src/context/user/exception/emailAlreadyExistsException";
import { PasswordNotSecureException } from "../../../../src/context/user/exception/passwordNotSecureException";
import { NotAbleToExecuteUserDbTransactionException } from "../../../../src/context/user/exception/notAbleToExecuteUserDbTransactionException";
import { InvalidRoleException } from "../../../../src/context/shared/exceptions/invalidRoleException";
import UserId from "../../../../src/context/shared/domain/userId";

describe("UserService", () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const userId = UserId.generate().toPrimitive();
  const mockUser = {
    getId: () => ({ toPrimitive: () => userId }),
    toPrimitives: () => ({
      id: userId,
      firstName: "John",
      familyName: "Doe",
      email: "john@example.com",
      role: Role.Client,
      emailVerified: true,
      password: "hashedPassword",
      imageUrl: "http://example.com/image.jpg",
      bio: "Test bio",
      phoneNumber: "123456789",
      nationalId: "ID123",
      joinedDate: new Date(),
    }),
    isEmailVerified: () => true,
    hasPassword: () => true,
    resetPassword: jest.fn(),
  } as unknown as User;

  beforeEach(async () => {
    const mockUserRepository = {
      addUser: jest.fn(),
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
      getAllUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserProfileDetails: jest.fn(),
    };

    const mockPasswordService = {
      isPasswordSecure: jest.fn(),
      hashPassword: jest.fn(),
    };

    const mockModuleConnectors = {
      sendVerificationEmail: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: ModuleConnectors,
          useValue: mockModuleConnectors,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    passwordService = module.get(PasswordService);
    moduleConnectors = module.get(ModuleConnectors);
  });

  describe("create", () => {
    const createUserRequest = {
      firstName: "John",
      familyName: "Doe",
      email: "john@example.com",
      password: "securePassword123",
      role: Role.Client,
      imageUrl: "http://example.com/image.jpg",
      bio: "Test bio",
      lng: Languages.ENGLISH,
    };

    it("should create a new user successfully", async () => {
      passwordService.isPasswordSecure.mockReturnValue(true);
      passwordService.hashPassword.mockResolvedValue("hashedPassword");
      userRepository.getUserByEmail.mockResolvedValue(null);
      userRepository.addUser.mockResolvedValue(mockUser as User);
      moduleConnectors.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.create(createUserRequest);

      expect(result).toEqual({
        id: userId,
        firstName: "John",
        familyName: "Doe",
        email: "john@example.com",
        role: Role.Client,
        emailVerified: true,
        imageUrl: "http://example.com/image.jpg",
      });
    });

    it("should throw PasswordNotSecureException when password is not secure", async () => {
      passwordService.isPasswordSecure.mockReturnValue(false);

      await expect(service.create(createUserRequest)).rejects.toThrow(
        PasswordNotSecureException,
      );
    });

    it("should throw EmailAlreadyExistsException when email already exists", async () => {
      passwordService.isPasswordSecure.mockReturnValue(true);
      userRepository.getUserByEmail.mockResolvedValue(mockUser as User);

      await expect(service.create(createUserRequest)).rejects.toThrow(
        EmailAlreadyExistsException,
      );
    });

    it("should throw InvalidRoleException when role is invalid", async () => {
      const invalidRequest = {
        ...createUserRequest,
        role: "INVALID_ROLE" as Role,
      };
      passwordService.isPasswordSecure.mockReturnValue(true);
      userRepository.getUserByEmail.mockResolvedValue(null);

      await expect(service.create(invalidRequest)).rejects.toThrow(
        InvalidRoleException,
      );
    });
  });

  describe("getById", () => {
    const userAuthInfo: UserAuthInfo = {
      id: userId,
      role: Role.Client,
      email: "john@example.com",
    };

    it("should return user by id", async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as User);

      const result = await service.getById(userAuthInfo);

      expect(result).toEqual({
        id: userId,
        firstName: "John",
        familyName: "Doe",
        email: "john@example.com",
        role: Role.Client,
        emailVerified: true,
        imageUrl: "http://example.com/image.jpg",
        bio: "Test bio",
        phoneNumber: "123456789",
        nationalId: "ID123",
      });
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(service.getById(userAuthInfo)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe("update", () => {
    const userAuthInfo: UserAuthInfo = {
      id: userId,
      role: Role.Client,
      email: "john@example.com",
    };

    const updateRequest = {
      firstName: "John",
      familyName: "Doe",
      phoneNumber: "123456789",
      nationalId: "ID123",
      imageUrl: "http://example.com/image.jpg",
      bio: "Test bio",
    };

    it("should update user successfully", async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as User);
      userRepository.updateUser.mockResolvedValue(mockUser as User);

      const result = await service.update(userAuthInfo, updateRequest);

      expect(result).toEqual({
        id: userId,
        firstName: "John",
        familyName: "Doe",
        email: "john@example.com",
        role: Role.Client,
        emailVerified: true,
        imageUrl: "http://example.com/image.jpg",
      });
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(service.update(userAuthInfo, updateRequest)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it("should throw NotAbleToExecuteUserDbTransactionException when update fails", async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as User);
      userRepository.updateUser.mockResolvedValue(null);

      await expect(service.update(userAuthInfo, updateRequest)).rejects.toThrow(
        NotAbleToExecuteUserDbTransactionException,
      );
    });
  });

  describe("deleteById", () => {
    const userAuthInfo: UserAuthInfo = {
      id: userId,
      role: Role.Client,
      email: "john@example.com",
    };

    it("should delete user successfully", async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as User);
      userRepository.deleteUser.mockResolvedValue(true);

      await expect(service.deleteById(userAuthInfo)).resolves.not.toThrow();
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(service.deleteById(userAuthInfo)).rejects.toThrow(
        UserNotFoundException,
      );
    });

    it("should throw NotAbleToExecuteUserDbTransactionException when delete fails", async () => {
      userRepository.getUserById.mockResolvedValue(mockUser as User);
      userRepository.deleteUser.mockResolvedValue(false);

      await expect(service.deleteById(userAuthInfo)).rejects.toThrow(
        NotAbleToExecuteUserDbTransactionException,
      );
    });
  });

  describe("requestResetPassword", () => {
    const resetPasswordRequest = {
      email: "john@example.com",
      lng: Languages.ENGLISH,
    };

    it("should send reset password email when user exists and is verified", async () => {
      userRepository.getUserByEmail.mockResolvedValue(mockUser as User);
      moduleConnectors.sendResetPasswordEmail.mockResolvedValue(undefined);

      await service.requestResetPassword(resetPasswordRequest);

      expect(moduleConnectors.sendResetPasswordEmail).toHaveBeenCalledWith(
        userId,
        "john@example.com",
        Languages.ENGLISH,
      );
    });

    it("should silently fail when user does not exist", async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);

      await service.requestResetPassword(resetPasswordRequest);

      expect(moduleConnectors.sendResetPasswordEmail).not.toHaveBeenCalled();
    });
  });

  describe("updatePassword", () => {
    const userAuthInfo: UserAuthInfo = {
      id: userId,
      role: Role.Client,
      email: "john@example.com",
    };

    it("should update password successfully", async () => {
      passwordService.isPasswordSecure.mockReturnValue(true);
      passwordService.hashPassword.mockResolvedValue("newHashedPassword");
      userRepository.getUserById.mockResolvedValue(mockUser as User);
      userRepository.updateUser.mockResolvedValue(mockUser as User);

      await service.updatePassword(userAuthInfo, "newSecurePassword123");

      expect(mockUser.resetPassword).toHaveBeenCalledWith("newHashedPassword");
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      userRepository.getUserById.mockResolvedValue(null);

      await expect(
        service.updatePassword(userAuthInfo, "newPassword"),
      ).rejects.toThrow(UserNotFoundException);
    });

    it("should throw PasswordNotSecureException when password is not secure", async () => {
      passwordService.isPasswordSecure.mockReturnValue(false);
      userRepository.getUserById.mockResolvedValue(mockUser as User);

      await expect(
        service.updatePassword(userAuthInfo, "weak"),
      ).rejects.toThrow(PasswordNotSecureException);
    });
  });
});

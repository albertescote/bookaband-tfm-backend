import { Test, TestingModule } from "@nestjs/testing";
import { CreateUserFromGoogleCommandHandler } from "../../../../src/context/user/service/createUserFromGoogle.commandHandler";
import { CreateUserFromGoogleCommand } from "../../../../src/context/user/service/createUserFromGoogle.command";
import { UserRepository } from "../../../../src/context/user/infrastructure/user.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { Role } from "../../../../src/context/shared/domain/role";
import { InvalidRoleException } from "../../../../src/context/shared/exceptions/invalidRoleException";
import { NotAbleToExecuteUserDbTransactionException } from "../../../../src/context/user/exception/notAbleToExecuteUserDbTransactionException";
import User from "../../../../src/context/shared/domain/user";
import UserId from "../../../../src/context/shared/domain/userId";
import { Languages } from "../../../../src/context/shared/domain/languages";

describe("CreateUserFromGoogleCommandHandler", () => {
  let handler: CreateUserFromGoogleCommandHandler;
  let userRepository: jest.Mocked<UserRepository>;
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
  } as unknown as User;

  beforeEach(async () => {
    const mockUserRepository = {
      addUser: jest.fn(),
    };

    const mockModuleConnectors = {
      createVerificationRecord: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserFromGoogleCommandHandler,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ModuleConnectors,
          useValue: mockModuleConnectors,
        },
      ],
    }).compile();

    handler = module.get<CreateUserFromGoogleCommandHandler>(
      CreateUserFromGoogleCommandHandler,
    );
    userRepository = module.get(UserRepository);
    moduleConnectors = module.get(ModuleConnectors);
  });

  describe("execute", () => {
    const validCommand = new CreateUserFromGoogleCommand(
      userId,
      "John",
      "Doe",
      "john@example.com",
      Role.Client,
      "http://example.com/image.jpg",
    );

    it("should create a user successfully", async () => {
      userRepository.addUser.mockResolvedValue(mockUser);
      moduleConnectors.createVerificationRecord.mockResolvedValue(undefined);

      await handler.execute(validCommand);

      expect(userRepository.addUser).toHaveBeenCalledWith(expect.any(User));
      expect(moduleConnectors.createVerificationRecord).toHaveBeenCalledWith(
        "john@example.com",
        userId,
        Languages.ENGLISH,
        true,
      );
    });

    it("should throw InvalidRoleException when role is invalid", async () => {
      const invalidCommand = new CreateUserFromGoogleCommand(
        userId,
        "John",
        "Doe",
        "john@example.com",
        "INVALID_ROLE",
        "http://example.com/image.jpg",
      );

      await expect(handler.execute(invalidCommand)).rejects.toThrow(
        InvalidRoleException,
      );
      expect(userRepository.addUser).not.toHaveBeenCalled();
      expect(moduleConnectors.createVerificationRecord).not.toHaveBeenCalled();
    });

    it("should throw NotAbleToExecuteUserDbTransactionException when user storage fails", async () => {
      userRepository.addUser.mockResolvedValue(null);

      await expect(handler.execute(validCommand)).rejects.toThrow(
        NotAbleToExecuteUserDbTransactionException,
      );
      expect(moduleConnectors.createVerificationRecord).not.toHaveBeenCalled();
    });

    it("should create user without imageUrl when not provided", async () => {
      const commandWithoutImage = new CreateUserFromGoogleCommand(
        userId,
        "John",
        "Doe",
        "john@example.com",
        Role.Client,
      );
      userRepository.addUser.mockResolvedValue(mockUser);
      moduleConnectors.createVerificationRecord.mockResolvedValue(undefined);

      await handler.execute(commandWithoutImage);

      expect(userRepository.addUser).toHaveBeenCalledWith(expect.any(User));
      expect(moduleConnectors.createVerificationRecord).toHaveBeenCalledWith(
        "john@example.com",
        userId,
        Languages.ENGLISH,
        true,
      );
    });

    it("should propagate errors from createVerificationRecord", async () => {
      userRepository.addUser.mockResolvedValue(mockUser);
      const error = new Error("Verification record creation failed");
      moduleConnectors.createVerificationRecord.mockRejectedValue(error);

      await expect(handler.execute(validCommand)).rejects.toThrow(error);
    });
  });
});

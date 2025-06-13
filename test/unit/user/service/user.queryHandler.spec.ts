import { Test, TestingModule } from "@nestjs/testing";
import { UserQueryHandler } from "../../../../src/context/user/service/user.queryHandler";
import { UserRepository } from "../../../../src/context/user/infrastructure/user.repository";
import { UserQuery } from "../../../../src/context/user/service/user.query";
import User from "../../../../src/context/shared/domain/user";
import UserId from "../../../../src/context/shared/domain/userId";
import { Role } from "../../../../src/context/shared/domain/role";

describe("UserQueryHandler", () => {
  let handler: UserQueryHandler;
  let userRepository: jest.Mocked<UserRepository>;

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
      getUserById: jest.fn(),
      getUserByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserQueryHandler,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    handler = module.get<UserQueryHandler>(UserQueryHandler);
    userRepository = module.get(UserRepository);
  });

  describe("execute", () => {
    it("should return user when querying by id", async () => {
      const query = new UserQuery(userId);
      userRepository.getUserById.mockResolvedValue(mockUser);

      const result = await handler.execute(query);

      expect(result).toBe(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        new UserId(userId),
      );
      expect(userRepository.getUserByEmail).not.toHaveBeenCalled();
    });

    it("should return user when querying by email", async () => {
      const email = "john@example.com";
      const query = new UserQuery(undefined, email);
      userRepository.getUserByEmail.mockResolvedValue(mockUser);

      const result = await handler.execute(query);

      expect(result).toBe(mockUser);
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.getUserById).not.toHaveBeenCalled();
    });

    it("should return undefined when user is not found by id", async () => {
      const query = new UserQuery(userId);
      userRepository.getUserById.mockResolvedValue(undefined);

      const result = await handler.execute(query);

      expect(result).toBeUndefined();
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        new UserId(userId),
      );
    });

    it("should return undefined when user is not found by email", async () => {
      const email = "nonexistent@example.com";
      const query = new UserQuery(undefined, email);
      userRepository.getUserByEmail.mockResolvedValue(undefined);

      const result = await handler.execute(query);

      expect(result).toBeUndefined();
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email);
    });

    it("should prioritize id over email when both are provided", async () => {
      const email = "john@example.com";
      const query = new UserQuery(userId, email);
      userRepository.getUserById.mockResolvedValue(mockUser);

      const result = await handler.execute(query);

      expect(result).toBe(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        new UserId(userId),
      );
      expect(userRepository.getUserByEmail).not.toHaveBeenCalled();
    });
  });
});

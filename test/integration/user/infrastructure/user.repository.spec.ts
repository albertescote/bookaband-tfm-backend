import { Test, TestingModule } from "@nestjs/testing";
import { UserRepository } from "../../../../src/context/user/infrastructure/user.repository";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import User from "../../../../src/context/shared/domain/user";
import UserId from "../../../../src/context/shared/domain/userId";
import { Role } from "../../../../src/context/shared/domain/role";
import { PasswordService } from "../../../../src/context/shared/infrastructure/password.service";
import { EmailVerification } from "../../../../src/context/email/domain/emailVerification";
import { Languages } from "../../../../src/context/shared/domain/languages";

describe("UserRepository Integration Tests", () => {
  let repository: UserRepository;
  let prismaService: PrismaService;
  let passwordService: PasswordService;
  let testUser: User;
  let testUserEmail: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserRepository, PrismaService, PasswordService],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
    testUserEmail = `test@example.com`;
  });

  beforeEach(async () => {
    testUser = User.create(
      "Test",
      "User",
      testUserEmail,
      Role.Client,
      "password123",
    );

    const hashedPassword = await passwordService.hashPassword(
      testUser.toPrimitives().password,
    );
    testUser = User.fromPrimitives({
      ...testUser.toPrimitives(),
      password: hashedPassword,
      emailVerified: true,
      imageUrl: "http://example.com/image.jpg",
      bio: "Test bio",
    });

    await repository.addUser(testUser);

    const emailVerification = EmailVerification.create(
      new UserId(testUser.toPrimitives().id),
      Languages.ENGLISH,
      testUserEmail,
    );
    emailVerification.verifyEmail();

    await prismaService.emailVerification.create({
      data: {
        id: emailVerification.toPrimitives().id,
        userId: emailVerification.toPrimitives().userId,
        language: emailVerification.toPrimitives().language,
        verified: emailVerification.toPrimitives().verified,
        lastEmailSentAt: emailVerification.toPrimitives().lastEmailSentAt,
        createdAt: emailVerification.toPrimitives().createdAt,
        updatedAt: emailVerification.toPrimitives().updatedAt,
      },
    });
  });

  afterEach(async () => {
    await prismaService.emailVerification.deleteMany({
      where: {
        userId: testUser.toPrimitives().id,
      },
    });
    await prismaService.user.deleteMany({
      where: {
        OR: [{ id: testUser.toPrimitives().id }, { email: testUserEmail }],
      },
    });
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe("addUser", () => {
    it("should add a new user successfully", async () => {
      const newUser = User.create(
        "New",
        "User",
        "new@example.com",
        Role.Musician,
        await passwordService.hashPassword("password123"),
      );

      const result = await repository.addUser(newUser);

      expect(result).toBeDefined();
      expect(result.getId().toPrimitive()).toBe(newUser.getId().toPrimitive());
      expect(result.toPrimitives()).toEqual(newUser.toPrimitives());

      await prismaService.user.delete({
        where: { id: newUser.getId().toPrimitive() },
      });
    });
  });

  describe("getUserById", () => {
    it("should retrieve a user by id", async () => {
      const result = await repository.getUserById(
        new UserId(testUser.toPrimitives().id),
      );

      expect(result).toBeDefined();
      expect(result.getId().toPrimitive()).toBe(testUser.toPrimitives().id);
      expect(result.toPrimitives()).toEqual(testUser.toPrimitives());
    });

    it("should return undefined for non-existent user id", async () => {
      const result = await repository.getUserById(UserId.generate());

      expect(result).toBeUndefined();
    });
  });

  describe("getUserByEmail", () => {
    it("should retrieve a user by email", async () => {
      const result = await repository.getUserByEmail("test@example.com");

      expect(result).toBeDefined();
      expect(result.toPrimitives().email).toBe("test@example.com");
      expect(result.toPrimitives()).toEqual(testUser.toPrimitives());
    });

    it("should return undefined for non-existent email", async () => {
      const result = await repository.getUserByEmail("nonexistent@example.com");

      expect(result).toBeUndefined();
    });
  });

  describe("getAllUsers", () => {
    it("should retrieve all users", async () => {
      const result = await repository.getAllUsers();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.some((user) => user.toPrimitives().email === "test@example.com"),
      ).toBe(true);
    });
  });

  describe("updateUser", () => {
    it("should update a user successfully", async () => {
      const updatedUser = User.fromPrimitives({
        ...testUser.toPrimitives(),
        firstName: "Updated",
        email: "updated@example.com",
      });

      const result = await repository.updateUser(
        new UserId(testUser.toPrimitives().id),
        updatedUser,
      );

      expect(result).toBeDefined();
      expect(result.toPrimitives().firstName).toBe("Updated");
      expect(result.toPrimitives().email).toBe("updated@example.com");
    });

    it("should return undefined when updating non-existent user", async () => {
      const nonExistentUser = User.create(
        "Non",
        "Existent",
        "nonexistent@example.com",
        Role.Client,
        await passwordService.hashPassword("hashedPassword"),
      );

      const result = await repository.updateUser(
        UserId.generate(),
        nonExistentUser,
      );

      expect(result).toBeUndefined();
    });
  });

  describe("deleteUser", () => {
    it("should delete a user successfully", async () => {
      const result = await repository.deleteUser(
        new UserId(testUser.toPrimitives().id),
      );

      expect(result).toBe(true);

      const deletedUser = await repository.getUserById(
        new UserId(testUser.toPrimitives().id),
      );
      expect(deletedUser).toBeUndefined();
    });

    it("should return false when deleting non-existent user", async () => {
      const result = await repository.deleteUser(UserId.generate());

      expect(result).toBe(false);
    });
  });

  describe("getUserProfileDetails", () => {
    it("should retrieve user profile details", async () => {
      const profileDetails = await repository.getUserProfileDetails(
        testUser.getId(),
      );
      expect(profileDetails).toBeDefined();
      expect(profileDetails.email).toBe("test@example.com");
      expect(profileDetails.firstName).toBe("Test");
      expect(profileDetails.familyName).toBe("User");
      expect(profileDetails.role).toBe(Role.Client);
      expect(profileDetails.imageUrl).toBe("http://example.com/image.jpg");
      expect(profileDetails.bio).toBe("Test bio");
      expect(profileDetails.paymentMethods).toEqual([]);
      expect(profileDetails.activitySummary).toEqual({
        musiciansContacted: 0,
        eventsOrganized: 0,
      });
    });

    it("should return undefined for non-existent user", async () => {
      const nonExistentId = "non-existent-id";
      const profileDetails = await repository.getUserProfileDetails({
        toPrimitive: () => nonExistentId,
      } as any);
      expect(profileDetails).toBeUndefined();
    });
  });
});

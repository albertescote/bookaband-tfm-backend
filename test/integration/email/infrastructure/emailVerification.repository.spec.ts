import { Test, TestingModule } from "@nestjs/testing";
import { EmailVerificationRepository } from "../../../../src/context/email/infrastructure/emailVerification.repository";
import { EmailVerification } from "../../../../src/context/email/domain/emailVerification";
import EmailVerificationId from "../../../../src/context/email/domain/emailVerificationId";
import UserId from "../../../../src/context/shared/domain/userId";
import { Languages } from "../../../../src/context/shared/domain/languages";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import User from "../../../../src/context/shared/domain/user";
import { Role } from "../../../../src/context/shared/domain/role";
import { UserRepository } from "../../../../src/context/user/infrastructure/user.repository";
import { PasswordService } from "../../../../src/context/shared/infrastructure/password.service";

describe("EmailVerificationRepository Integration Tests", () => {
  let repository: EmailVerificationRepository;
  let userRepository: UserRepository;
  let prismaService: PrismaService;
  let passwordService: PasswordService;
  let module: TestingModule;

  const testUserEmail = `test-${Date.now()}@example.com`;
  let testUser: User;
  let testEmailVerification: EmailVerification;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        EmailVerificationRepository,
        UserRepository,
        PrismaService,
        PasswordService,
      ],
    }).compile();

    repository = module.get<EmailVerificationRepository>(
      EmailVerificationRepository,
    );
    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
    await module.close();
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

    await userRepository.addUser(testUser);

    testEmailVerification = EmailVerification.create(
      new UserId(testUser.toPrimitives().id),
      Languages.ENGLISH,
      testUserEmail,
    );
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

  describe("createVerificationRecord", () => {
    it("should create a new email verification record", async () => {
      const createdVerification = await repository.createVerificationRecord(
        testEmailVerification,
      );

      expect(createdVerification).toBeDefined();
      expect(createdVerification.toPrimitives()).toEqual(
        testEmailVerification.toPrimitives(),
      );

      const storedVerification = await repository.getVerificationRecordById(
        testEmailVerification.getId(),
      );
      expect(storedVerification.toPrimitives()).toEqual(
        testEmailVerification.toPrimitives(),
      );
    });
  });

  describe("getVerificationRecordById", () => {
    it("should return an email verification record by id", async () => {
      await repository.createVerificationRecord(testEmailVerification);

      const foundVerification = await repository.getVerificationRecordById(
        testEmailVerification.getId(),
      );

      expect(foundVerification).toBeDefined();
      expect(foundVerification.toPrimitives()).toEqual(
        testEmailVerification.toPrimitives(),
      );
    });

    it("should return undefined when email verification does not exist", async () => {
      const nonExistentId = EmailVerificationId.generate();
      const foundVerification =
        await repository.getVerificationRecordById(nonExistentId);

      expect(foundVerification).toBeUndefined();
    });
  });

  describe("getVerificationRecordByUserId", () => {
    it("should return an email verification record by user id", async () => {
      await repository.createVerificationRecord(testEmailVerification);

      const foundVerification = await repository.getVerificationRecordByUserId(
        new UserId(testUser.toPrimitives().id),
      );

      expect(foundVerification).toBeDefined();
      expect(foundVerification.toPrimitives()).toEqual(
        testEmailVerification.toPrimitives(),
      );
    });

    it("should return undefined when email verification does not exist for user", async () => {
      const nonExistentUserId = UserId.generate();
      const foundVerification =
        await repository.getVerificationRecordByUserId(nonExistentUserId);

      expect(foundVerification).toBeUndefined();
    });
  });

  describe("updateVerificationRecord", () => {
    it("should update an existing email verification record", async () => {
      await repository.createVerificationRecord(testEmailVerification);

      testEmailVerification.verifyEmail();
      const updatedVerification = await repository.updateVerificationRecord(
        testEmailVerification,
      );

      expect(updatedVerification).toBeDefined();
      expect(updatedVerification.toPrimitives().verified).toBe(true);

      const storedVerification = await repository.getVerificationRecordById(
        testEmailVerification.getId(),
      );
      expect(storedVerification.toPrimitives().verified).toBe(true);
    });

    it("should return undefined when trying to update non-existent record", async () => {
      const nonExistentVerification = EmailVerification.create(
        UserId.generate(),
        Languages.ENGLISH,
        "nonexistent@example.com",
      );

      const updatedVerification = await repository.updateVerificationRecord(
        nonExistentVerification,
      );

      expect(updatedVerification).toBeUndefined();
    });
  });
});

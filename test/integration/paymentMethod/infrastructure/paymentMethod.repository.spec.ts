import { Test, TestingModule } from "@nestjs/testing";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { PaymentMethodRepository } from "../../../../src/context/paymentMethod/infrastructure/paymentMethod.repository";
import { PaymentMethod } from "../../../../src/context/paymentMethod/domain/paymentMethod";
import UserId from "../../../../src/context/shared/domain/userId";
import PaymentMethodId from "../../../../src/context/paymentMethod/domain/paymentMethodId";
import User from "../../../../src/context/shared/domain/user";
import { Role } from "../../../../src/context/shared/domain/role";
import { PasswordService } from "../../../../src/context/shared/infrastructure/password.service";
import { EmailVerification } from "../../../../src/context/email/domain/emailVerification";
import { Languages } from "../../../../src/context/shared/domain/languages";

describe("PaymentMethodRepository Integration Tests", () => {
  let repository: PaymentMethodRepository;
  let prismaService: PrismaService;
  let passwordService: PasswordService;
  let testUser: User;
  let testUserEmail: string;
  let testPaymentMethod: PaymentMethod;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentMethodRepository, PrismaService, PasswordService],
    }).compile();

    repository = module.get<PaymentMethodRepository>(PaymentMethodRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
    testUserEmail = `test-${Date.now()}@example.com`;
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
    });

    await prismaService.user.create({
      data: {
        id: testUser.toPrimitives().id,
        firstName: testUser.toPrimitives().firstName,
        familyName: testUser.toPrimitives().familyName,
        email: testUser.toPrimitives().email,
        role: testUser.toPrimitives().role,
        password: testUser.toPrimitives().password,
        joinedDate: testUser.toPrimitives().joinedDate,
      },
    });

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

    testPaymentMethod = PaymentMethod.create(
      new UserId(testUser.toPrimitives().id),
      "stripe",
      "pm_123",
      "card",
      "4242",
      true,
      "visa",
      "Test Card",
    );

    await prismaService.paymentMethod.create({
      data: {
        userId: testPaymentMethod.toPrimitives().userId,
        provider: testPaymentMethod.toPrimitives().provider,
        providerId: testPaymentMethod.toPrimitives().providerId,
        type: testPaymentMethod.toPrimitives().type,
        lastFour: testPaymentMethod.toPrimitives().lastFour,
        isDefault: testPaymentMethod.toPrimitives().isDefault,
        brand: testPaymentMethod.toPrimitives().brand,
        alias: testPaymentMethod.toPrimitives().alias,
      },
    });

    const createdPaymentMethod = await prismaService.paymentMethod.findFirst({
      where: {
        userId: testPaymentMethod.toPrimitives().userId,
        providerId: testPaymentMethod.toPrimitives().providerId,
      },
    });

    if (!createdPaymentMethod) {
      throw new Error("Failed to create test payment method");
    }

    testPaymentMethod = PaymentMethod.fromPrimitives({
      ...testPaymentMethod.toPrimitives(),
      id: createdPaymentMethod.id,
    });
  });

  afterEach(async () => {
    await prismaService.paymentMethod.deleteMany({
      where: {
        OR: [
          { id: testPaymentMethod.toPrimitives().id },
          { providerId: "pm_123" },
        ],
      },
    });

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

  describe("findById", () => {
    it("should retrieve payment method by id", async () => {
      const method = await repository.findById(
        new PaymentMethodId(testPaymentMethod.toPrimitives().id),
      );
      expect(method).toBeDefined();
      expect(method.toPrimitives()).toEqual({
        ...testPaymentMethod.toPrimitives(),
        createdAt: expect.any(Date),
      });
    });

    it("should return undefined for non-existent payment method id", async () => {
      const nonExistentId = PaymentMethodId.generate();
      const method = await repository.findById(nonExistentId);
      expect(method).toBeUndefined();
    });
  });

  describe("findByUserId", () => {
    it("should retrieve payment methods by user id", async () => {
      const methods = await repository.findByUserId(
        new UserId(testUser.toPrimitives().id),
      );
      expect(methods).toBeDefined();
      expect(Array.isArray(methods)).toBe(true);
      expect(methods.length).toBeGreaterThan(0);
      expect(methods[0].toPrimitives()).toEqual({
        ...testPaymentMethod.toPrimitives(),
        createdAt: expect.any(Date),
      });
    });

    it("should return undefined for user with no payment methods", async () => {
      const newUserId = UserId.generate();
      const methods = await repository.findByUserId(newUserId);
      expect(methods).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should successfully create a new payment method", async () => {
      const newPaymentMethod = PaymentMethod.create(
        new UserId(testUser.toPrimitives().id),
        "stripe",
        "pm_456",
        "card",
        "1234",
        false,
        "mastercard",
        "New Card",
      );

      const created = await repository.create(newPaymentMethod);
      expect(created).toBeDefined();
      expect(created.toPrimitives()).toEqual(newPaymentMethod.toPrimitives());

      await prismaService.paymentMethod.delete({
        where: { id: created.toPrimitives().id },
      });
    });
  });

  describe("update", () => {
    it("should successfully update a payment method", async () => {
      const existingPaymentMethod = await prismaService.paymentMethod.findFirst(
        {
          where: {
            userId: testUser.toPrimitives().id,
            providerId: testPaymentMethod.toPrimitives().providerId,
          },
        },
      );

      if (!existingPaymentMethod) {
        throw new Error("Test payment method not found in database");
      }

      const updatedPaymentMethod = PaymentMethod.fromPrimitives({
        ...testPaymentMethod.toPrimitives(),
        id: existingPaymentMethod.id,
        isDefault: false,
        alias: "Updated Card",
      });

      const updated = await repository.update(updatedPaymentMethod);
      expect(updated).toBeDefined();
      expect(updated.toPrimitives()).toEqual(
        updatedPaymentMethod.toPrimitives(),
      );
    });

    it("should return undefined when updating non-existent payment method", async () => {
      const nonExistentPaymentMethod = PaymentMethod.create(
        new UserId(testUser.toPrimitives().id),
        "stripe",
        "pm_789",
        "card",
        "5678",
        true,
        "amex",
        "Non-existent Card",
      );

      const updated = await repository.update(nonExistentPaymentMethod);
      expect(updated).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("should successfully delete a payment method", async () => {
      await expect(
        repository.delete(
          new PaymentMethodId(testPaymentMethod.toPrimitives().id),
        ),
      ).resolves.not.toThrow();

      const deleted = await repository.findById(
        new PaymentMethodId(testPaymentMethod.toPrimitives().id),
      );
      expect(deleted).toBeUndefined();
    });

    it("should not throw when deleting non-existent payment method", async () => {
      const nonExistentId = PaymentMethodId.generate();
      await expect(repository.delete(nonExistentId)).resolves.not.toThrow();
    });
  });
});

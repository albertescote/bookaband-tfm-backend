import { Test, TestingModule } from "@nestjs/testing";
import { BillingAddressRepository } from "../../../../src/context/billingAddress/infrastructure/billingAddress.repository";
import { BillingAddress } from "../../../../src/context/billingAddress/domain/billingAddress";
import { Role } from "../../../../src/context/shared/domain/role";
import UserId from "../../../../src/context/shared/domain/userId";
import BillingAddressId from "../../../../src/context/billingAddress/domain/billingAddressId";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { v4 as uuidv4 } from "uuid";

describe("BillingAddressRepository Integration Tests", () => {
  let repository: BillingAddressRepository;
  let prismaService: PrismaService;
  let testUserId: string;
  let testBillingAddressId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillingAddressRepository, PrismaService],
    }).compile();

    repository = module.get<BillingAddressRepository>(BillingAddressRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.billingAddress.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await prismaService.billingAddress.deleteMany({});
    await prismaService.user.deleteMany({});

    testUserId = uuidv4();
    testBillingAddressId = uuidv4();

    await prismaService.user.create({
      data: {
        id: testUserId,
        firstName: "Test",
        familyName: "User",
        email: "test@example.com",
        role: Role.Client,
        phoneNumber: "123456789",
      },
    });
  });

  describe("create", () => {
    it("should create a new billing address", async () => {
      const billingAddress = new BillingAddress(
        new BillingAddressId(testBillingAddressId),
        new UserId(testUserId),
        "Spain",
        "Barcelona",
        "08001",
        "Carrer Example 123",
        "Floor 4",
      );

      const createdAddress = await repository.create(billingAddress);

      expect(createdAddress).toBeDefined();
      expect(createdAddress.toPrimitives()).toEqual({
        id: testBillingAddressId,
        userId: testUserId,
        country: "Spain",
        city: "Barcelona",
        postalCode: "08001",
        addressLine1: "Carrer Example 123",
        addressLine2: "Floor 4",
      });
    });
  });

  describe("findById", () => {
    it("should return undefined for non-existent billing address", async () => {
      const result = await repository.findById(new BillingAddressId(uuidv4()));
      expect(result).toBeUndefined();
    });

    it("should find billing address by id", async () => {
      const billingAddress = new BillingAddress(
        new BillingAddressId(testBillingAddressId),
        new UserId(testUserId),
        "Spain",
        "Barcelona",
        "08001",
        "Carrer Example 123",
        "Floor 4",
      );
      await repository.create(billingAddress);

      const foundAddress = await repository.findById(
        new BillingAddressId(testBillingAddressId),
      );

      expect(foundAddress).toBeDefined();
      expect(foundAddress.toPrimitives()).toEqual({
        id: testBillingAddressId,
        userId: testUserId,
        country: "Spain",
        city: "Barcelona",
        postalCode: "08001",
        addressLine1: "Carrer Example 123",
        addressLine2: "Floor 4",
      });
    });
  });

  describe("findByUserId", () => {
    it("should return undefined for non-existent user", async () => {
      const result = await repository.findByUserId(new UserId(uuidv4()));
      expect(result).toBeUndefined();
    });

    it("should find billing address by user id", async () => {
      const billingAddress = new BillingAddress(
        new BillingAddressId(testBillingAddressId),
        new UserId(testUserId),
        "Spain",
        "Barcelona",
        "08001",
        "Carrer Example 123",
        "Floor 4",
      );
      await repository.create(billingAddress);

      const foundAddress = await repository.findByUserId(
        new UserId(testUserId),
      );

      expect(foundAddress).toBeDefined();
      expect(foundAddress.toPrimitives()).toEqual({
        id: testBillingAddressId,
        userId: testUserId,
        country: "Spain",
        city: "Barcelona",
        postalCode: "08001",
        addressLine1: "Carrer Example 123",
        addressLine2: "Floor 4",
      });
    });
  });

  describe("update", () => {
    it("should update an existing billing address", async () => {
      const billingAddress = new BillingAddress(
        new BillingAddressId(testBillingAddressId),
        new UserId(testUserId),
        "Spain",
        "Barcelona",
        "08001",
        "Carrer Example 123",
        "Floor 4",
      );
      await repository.create(billingAddress);

      const updatedAddress = new BillingAddress(
        new BillingAddressId(testBillingAddressId),
        new UserId(testUserId),
        "Spain",
        "Madrid",
        "28001",
        "Calle Example 456",
        "Floor 2",
      );

      const result = await repository.update(updatedAddress);

      expect(result).toBeDefined();
      expect(result.toPrimitives()).toEqual({
        id: testBillingAddressId,
        userId: testUserId,
        country: "Spain",
        city: "Madrid",
        postalCode: "28001",
        addressLine1: "Calle Example 456",
        addressLine2: "Floor 2",
      });
    });
  });

  describe("delete", () => {
    it("should delete a billing address", async () => {
      const billingAddress = new BillingAddress(
        new BillingAddressId(testBillingAddressId),
        new UserId(testUserId),
        "Spain",
        "Barcelona",
        "08001",
        "Carrer Example 123",
        "Floor 4",
      );
      await repository.create(billingAddress);

      await repository.delete(new BillingAddressId(testBillingAddressId));

      const foundAddress = await repository.findById(
        new BillingAddressId(testBillingAddressId),
      );
      expect(foundAddress).toBeUndefined();
    });
  });
});

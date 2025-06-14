import { Test, TestingModule } from "@nestjs/testing";
import { ContractRepository } from "../../../../src/context/contract/infrastructure/contract.repository";
import { Contract } from "../../../../src/context/contract/domain/contract";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { v4 as uuidv4 } from "uuid";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";

describe("ContractRepository Integration Tests", () => {
  let repository: ContractRepository;
  let prismaService: PrismaService;
  let testContract: Contract;
  let testContractId: string;
  let testBookingId: string;
  let testBandId: string;
  let testUserId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContractRepository, PrismaService],
    }).compile();

    repository = module.get<ContractRepository>(ContractRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    const testUser = await prismaService.user.create({
      data: {
        id: uuidv4(),
        firstName: "Test",
        familyName: "User",
        email: "test@example.com",
        role: "CLIENT",
        phoneNumber: "123456789",
        joinedDate: new Date(),
      },
    });
    testUserId = testUser.id;

    const technicalRiderId = uuidv4();
    const hospitalityRiderId = uuidv4();
    const performanceAreaId = uuidv4();

    await prismaService.technicalRider.create({
      data: {
        id: technicalRiderId,
        soundSystem: "Test Sound System",
        microphones: "Test Microphones",
        backline: "Test Backline",
        lighting: "Test Lighting",
      },
    });

    await prismaService.hospitalityRider.create({
      data: {
        id: hospitalityRiderId,
        accommodation: "Test Accommodation",
        catering: "Test Catering",
        beverages: "Test Beverages",
      },
    });

    await prismaService.performanceArea.create({
      data: {
        id: performanceAreaId,
        regions: ["Barcelona", "Girona", "Tarragona"],
        gasPriceCalculation: {
          fuelConsumption: 9.5,
          useDynamicPricing: false,
          pricePerLiter: 1.88,
        },
        otherComments: "Prefer venues with good acoustics",
      },
    });

    const testBand = await prismaService.band.create({
      data: {
        id: BandId.generate().toPrimitive(),
        name: "Test Band",
        musicalStyleIds: [],
        followers: 0,
        following: 0,
        createdAt: new Date(),
        price: 1000,
        location: "Test Location",
        bandSize: BandSize.BAND,
        eventTypeIds: [],
        featured: false,
        visible: true,
        weeklyAvailability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: true,
        },
        technicalRiderId: technicalRiderId,
        hospitalityRiderId: hospitalityRiderId,
        performanceAreaId: performanceAreaId,
      },
    });
    testBandId = testBand.id;

    const testBooking = await prismaService.booking.create({
      data: {
        id: BookingId.generate().toPrimitive(),
        bandId: testBandId,
        userId: testUserId,
        status: BookingStatus.PENDING,
        name: "Test Booking",
        initDate: new Date(),
        endDate: new Date(),
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    testBookingId = testBooking.id;

    testContract = Contract.create(
      new BookingId(testBookingId),
      "test-contract.pdf",
      uuidv4(),
    );
    testContractId = testContract.getId().toPrimitive();
  });

  afterAll(async () => {
    await prismaService.contract.deleteMany();
    await prismaService.booking.deleteMany();
    await prismaService.band.deleteMany();
    await prismaService.user.deleteMany();
    await prismaService.technicalRider.deleteMany();
    await prismaService.hospitalityRider.deleteMany();
    await prismaService.performanceArea.deleteMany();
    await prismaService.$disconnect();
  });

  describe("create", () => {
    it("should create a new contract", async () => {
      const createdContract = await repository.create(testContract);

      expect(createdContract).toBeDefined();
      expect(createdContract.getId().toPrimitive()).toBe(testContractId);
      expect(createdContract.getBookingId().toPrimitive()).toBe(testBookingId);
      expect(createdContract.getFileUrl()).toBe("test-contract.pdf");
      expect(createdContract.isUserSigned()).toBe(false);
      expect(createdContract.isBandSigned()).toBe(false);
    });
  });

  describe("findById", () => {
    it("should return undefined when contract does not exist", async () => {
      const nonExistentId = ContractId.generate();
      const foundContract = await repository.findById(nonExistentId);

      expect(foundContract).toBeUndefined();
    });

    it("should return the contract when it exists", async () => {
      const foundContract = await repository.findById(
        new ContractId(testContractId),
      );

      expect(foundContract).toBeDefined();
      expect(foundContract.getId().toPrimitive()).toBe(testContractId);
      expect(foundContract.getBookingId().toPrimitive()).toBe(testBookingId);
    });
  });

  describe("findByBookingId", () => {
    it("should return undefined when contract does not exist for booking", async () => {
      const nonExistentBookingId = BookingId.generate();
      const foundContract =
        await repository.findByBookingId(nonExistentBookingId);

      expect(foundContract).toBeUndefined();
    });

    it("should return the contract when it exists for booking", async () => {
      const foundContract = await repository.findByBookingId(
        new BookingId(testBookingId),
      );

      expect(foundContract).toBeDefined();
      expect(foundContract.getId().toPrimitive()).toBe(testContractId);
      expect(foundContract.getBookingId().toPrimitive()).toBe(testBookingId);
    });
  });

  describe("findManyByUserId", () => {
    it("should return contracts for user", async () => {
      const contracts = await repository.findManyByUserId(testUserId);

      expect(contracts).toBeDefined();
      expect(contracts.length).toBeGreaterThan(0);
      expect(contracts[0].getBookingId().toPrimitive()).toBe(testBookingId);
    });
  });

  describe("findManyByBandId", () => {
    it("should return contracts for band", async () => {
      const contracts = await repository.findManyByBandId(
        new BandId(testBandId),
      );

      expect(contracts).toBeDefined();
      expect(contracts.length).toBeGreaterThan(0);
      expect(contracts[0].getBookingId().toPrimitive()).toBe(testBookingId);
    });
  });

  describe("update", () => {
    it("should update an existing contract", async () => {
      const contract = await repository.findById(
        new ContractId(testContractId),
      );
      contract.setUserSigned();
      contract.setBandSigned();

      const updatedContract = await repository.update(contract);

      expect(updatedContract).toBeDefined();
      expect(updatedContract.isUserSigned()).toBe(true);
      expect(updatedContract.isBandSigned()).toBe(true);
    });
  });

  describe("findByVidSignerDocGui", () => {
    it("should return undefined when contract does not exist for docGui", async () => {
      const nonExistentDocGui = uuidv4();
      const foundContract =
        await repository.findByVidSignerDocGui(nonExistentDocGui);

      expect(foundContract).toBeUndefined();
    });

    it("should return the contract when it exists for docGui", async () => {
      const contract = await repository.findById(
        new ContractId(testContractId),
      );
      const foundContract = await repository.findByVidSignerDocGui(
        contract.toPrimitives().vidsignerDocGui,
      );

      expect(foundContract).toBeDefined();
      expect(foundContract.getId().toPrimitive()).toBe(testContractId);
    });
  });

  describe("delete", () => {
    it("should delete an existing contract", async () => {
      await repository.delete(new ContractId(testContractId));

      const foundContract = await repository.findById(
        new ContractId(testContractId),
      );
      expect(foundContract).toBeUndefined();
    });
  });
});

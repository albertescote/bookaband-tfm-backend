import { Test, TestingModule } from "@nestjs/testing";
import { InvoiceRepository } from "../../../../src/context/invoice/infrastructure/invoice.repository";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { Invoice } from "../../../../src/context/invoice/domain/invoice";
import { InvoiceStatus } from "../../../../src/context/invoice/domain/invoiceStatus";
import InvoiceId from "../../../../src/context/shared/domain/invoiceId";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import UserId from "../../../../src/context/shared/domain/userId";
import { Role } from "../../../../src/context/shared/domain/role";
import BandId from "../../../../src/context/shared/domain/bandId";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import { ContractStatus } from "../../../../src/context/contract/domain/contractStatus";
import { v4 as uuidv4 } from "uuid";

describe("InvoiceRepository Integration Tests", () => {
  let repository: InvoiceRepository;
  let prismaService: PrismaService;
  let testInvoice: Invoice;
  let testContractId: string;
  let testUserId: string;
  let testBandId: string;
  let testBookingId: string;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [InvoiceRepository, PrismaService],
    }).compile();

    repository = module.get<InvoiceRepository>(InvoiceRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  const performanceAreaId = uuidv4().toString();
  const technicalRiderId = uuidv4().toString();
  const hospitalityRiderId = uuidv4().toString();

  beforeEach(async () => {
    const testUser = await prismaService.user.create({
      data: {
        id: UserId.generate().toPrimitive(),
        firstName: "Test",
        familyName: "User",
        email: `test-${Date.now()}@example.com`,
        role: Role.Client,
        password: "hashedPassword",
        joinedDate: new Date(),
      },
    });
    testUserId = testUser.id;

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

    const testContract = await prismaService.contract.create({
      data: {
        id: ContractId.generate().toPrimitive(),
        bookingId: testBookingId,
        status: ContractStatus.SIGNED,
        fileUrl: "test-contract.pdf",
        userSigned: true,
        bandSigned: true,
        vidsignerDocGui: uuidv4().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    testContractId = testContract.id;

    testInvoice = Invoice.create(
      new ContractId(testContractId),
      100.0,
      "test-invoice.pdf",
    );
    await repository.create(testInvoice);
  });

  afterEach(async () => {
    await prismaService.invoice.deleteMany({
      where: {
        OR: [
          { id: testInvoice.toPrimitives().id },
          { contractId: testContractId },
        ],
      },
    });
    await prismaService.contract.deleteMany({
      where: { id: testContractId },
    });
    await prismaService.booking.deleteMany({
      where: { id: testBookingId },
    });
    await prismaService.band.deleteMany({
      where: { id: testBandId },
    });
    await prismaService.technicalRider.deleteMany({
      where: { id: technicalRiderId },
    });
    await prismaService.hospitalityRider.deleteMany({
      where: { id: hospitalityRiderId },
    });
    await prismaService.performanceArea.deleteMany({
      where: { id: performanceAreaId },
    });
    await prismaService.user.deleteMany({
      where: { id: testUserId },
    });
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  describe("findById", () => {
    it("should retrieve invoice by id", async () => {
      const invoice = await repository.findById(
        new InvoiceId(testInvoice.toPrimitives().id),
      );
      expect(invoice).toBeDefined();
      expect(invoice.toPrimitives()).toEqual(testInvoice.toPrimitives());
    });

    it("should return undefined for non-existent invoice id", async () => {
      const nonExistentId = InvoiceId.generate();
      const invoice = await repository.findById(nonExistentId);
      expect(invoice).toBeUndefined();
    });
  });

  describe("findManyByUserId", () => {
    it("should retrieve all invoices for a user", async () => {
      const invoices = await repository.findManyByUserId(testUserId);
      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBeGreaterThan(0);
      expect(invoices[0].toPrimitives()).toEqual(testInvoice.toPrimitives());
    });
  });

  describe("findManyByBandId", () => {
    it("should retrieve all invoices for a band", async () => {
      const invoices = await repository.findManyByBandId(testBandId);
      expect(invoices).toBeDefined();
      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBeGreaterThan(0);
      expect(invoices[0].toPrimitives()).toEqual(testInvoice.toPrimitives());
    });
  });

  describe("update", () => {
    it("should successfully update an invoice", async () => {
      const updatedInvoice = Invoice.fromPrimitives({
        ...testInvoice.toPrimitives(),
        status: InvoiceStatus.PAID,
      });

      const updated = await repository.update(updatedInvoice);
      expect(updated).toBeDefined();
      expect(updated.toPrimitives()).toEqual(updatedInvoice.toPrimitives());

      const retrieved = await repository.findById(
        new InvoiceId(updatedInvoice.toPrimitives().id),
      );
      expect(retrieved.toPrimitives()).toEqual(updatedInvoice.toPrimitives());
    });
  });

  describe("delete", () => {
    it("should successfully delete an invoice", async () => {
      await repository.delete(new InvoiceId(testInvoice.toPrimitives().id));

      const deleted = await repository.findById(
        new InvoiceId(testInvoice.toPrimitives().id),
      );
      expect(deleted).toBeUndefined();
    });
  });

  describe("findByBookingId", () => {
    it("should retrieve invoice by booking id", async () => {
      const invoice = await repository.findByBookingId(
        new BookingId(testBookingId),
      );
      expect(invoice).toBeDefined();
      expect(invoice.toPrimitives()).toEqual(testInvoice.toPrimitives());
    });
  });

  describe("getBookingIdByInvoiceId", () => {
    it("should retrieve booking id by invoice id", async () => {
      const bookingId = await repository.getBookingIdByInvoiceId(
        new InvoiceId(testInvoice.toPrimitives().id),
      );
      expect(bookingId).toBeDefined();
      expect(bookingId.toPrimitive()).toBe(testBookingId);
    });
  });

  describe("getBandIdByInvoiceId", () => {
    it("should retrieve band id by invoice id", async () => {
      const bandId = await repository.getBandIdByInvoiceId(
        new InvoiceId(testInvoice.toPrimitives().id),
      );
      expect(bandId).toBeDefined();
      expect(bandId.toPrimitive()).toBe(testBandId);
    });
  });
});

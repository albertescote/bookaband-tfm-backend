import { Test, TestingModule } from "@nestjs/testing";
import { BookingRepository } from "../../../../src/context/booking/infrastructure/booking.repository";
import { BookingModule } from "../../../../src/context/booking/booking.module";
import { Booking } from "../../../../src/context/booking/domain/booking";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import ContractId from "../../../../src/context/shared/domain/contractId";
import InvoiceId from "../../../../src/context/shared/domain/invoiceId";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";
import { Role } from "../../../../src/context/shared/domain/role";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { v4 as uuidv4 } from "uuid";

describe("BookingRepository Integration Tests", () => {
  let repository: BookingRepository;
  let prismaService: PrismaService;

  const testUserId = UserId.generate().toPrimitive();
  const testBandId = BandId.generate().toPrimitive();
  const testBookingId = BookingId.generate().toPrimitive();
  const testContractId = ContractId.generate().toPrimitive();
  const testInvoiceId = InvoiceId.generate().toPrimitive();
  const testEventTypeId = EventTypeId.generate().toPrimitive();
  const testTechnicalRiderId = uuidv4();
  const testHospitalityRiderId = uuidv4();
  const testPerformanceAreaId = uuidv4();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [BookingModule],
    }).compile();

    repository = moduleFixture.get<BookingRepository>(BookingRepository);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.booking.deleteMany({});
    await prismaService.band.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.technicalRider.deleteMany({});
    await prismaService.hospitalityRider.deleteMany({});
    await prismaService.performanceArea.deleteMany({});
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await prismaService.booking.deleteMany({});
    await prismaService.band.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.technicalRider.deleteMany({});
    await prismaService.hospitalityRider.deleteMany({});
    await prismaService.performanceArea.deleteMany({});

    await prismaService.user.create({
      data: {
        id: testUserId,
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "Test",
        familyName: "User",
        role: Role.Client,
      },
    });

    await prismaService.technicalRider.create({
      data: {
        id: testTechnicalRiderId,
        soundSystem: "Test Sound System",
        microphones: "Test Microphones",
        backline: "Test Backline",
        lighting: "Test Lighting",
      },
    });

    await prismaService.hospitalityRider.create({
      data: {
        id: testHospitalityRiderId,
        accommodation: "Test Accommodation",
        catering: "Test Catering",
        beverages: "Test Beverages",
      },
    });

    await prismaService.performanceArea.create({
      data: {
        id: testPerformanceAreaId,
        regions: ["Barcelona", "Girona", "Tarragona"],
        gasPriceCalculation: {
          fuelConsumption: 9.5,
          useDynamicPricing: false,
          pricePerLiter: 1.88,
        },
        otherComments: "Prefer venues with good acoustics",
      },
    });

    await prismaService.band.create({
      data: {
        id: testBandId,
        name: "Test Band",
        musicalStyleIds: [],
        followers: 0,
        following: 0,
        createdAt: new Date(),
        price: 100,
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
        technicalRiderId: testTechnicalRiderId,
        hospitalityRiderId: testHospitalityRiderId,
        performanceAreaId: testPerformanceAreaId,
        imageUrl: "test-image-url",
      },
    });
  });

  describe("save", () => {
    it("should create a new booking", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );

      const savedBooking = await repository.save(booking);
      expect(savedBooking).toBeDefined();
      expect(savedBooking.toPrimitives().id).toBe(testBookingId);
      expect(savedBooking.toPrimitives().status).toBe(BookingStatus.PENDING);
    });

    it("should update an existing booking", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      const updatedBooking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.ACCEPTED,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Updated Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );

      const savedBooking = await repository.save(updatedBooking);
      expect(savedBooking).toBeDefined();
      expect(savedBooking.toPrimitives().id).toBe(testBookingId);
      expect(savedBooking.toPrimitives().status).toBe(BookingStatus.ACCEPTED);
      expect(savedBooking.toPrimitives().name).toBe("Updated Event");
    });
  });

  describe("findById", () => {
    it("should return undefined when booking does not exist", async () => {
      const nonExistentId = BookingId.generate();
      const foundBooking = await repository.findById(nonExistentId);
      expect(foundBooking).toBeUndefined();
    });

    it("should return the booking when it exists", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      const foundBooking = await repository.findById(
        new BookingId(testBookingId),
      );
      expect(foundBooking).toBeDefined();
      expect(foundBooking.toPrimitives().id).toBe(testBookingId);
      expect(foundBooking.toPrimitives().status).toBe(BookingStatus.PENDING);
    });
  });

  describe("getBookingPrice", () => {
    it("should return the band price for a booking", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      const price = await repository.getBookingPrice(
        new BookingId(testBookingId),
      );
      expect(price).toBeDefined();
    });
  });

  describe("findByIdWithDetails", () => {
    it("should return booking with band and user details", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      const bookingWithDetails = await repository.findByIdWithDetails(
        new BookingId(testBookingId),
      );
      expect(bookingWithDetails).toBeDefined();
      const primitives = bookingWithDetails.toPrimitives();
      expect(primitives.id).toBe(testBookingId);
      expect(primitives.bandName).toBeDefined();
      expect(primitives.userName).toBeDefined();
    });
  });

  describe("findAllByUserId", () => {
    it("should return all bookings for a user", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      const bookings = await repository.findAllByUserId(new UserId(testUserId));
      expect(bookings).toBeDefined();
      expect(bookings).toHaveLength(1);
      expect(bookings[0].toPrimitives().id).toBe(testBookingId);
    });
  });

  describe("findAllByBandId", () => {
    it("should return all bookings for a band", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      const bookings = await repository.findAllByBandId(new BandId(testBandId));
      expect(bookings).toBeDefined();
      expect(bookings).toHaveLength(1);
      expect(bookings[0].toPrimitives().id).toBe(testBookingId);
    });
  });

  describe("findByContractId", () => {
    it("should return booking for a contract", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      await prismaService.contract.create({
        data: {
          id: testContractId,
          bookingId: testBookingId,
          status: "PENDING",
          fileUrl: "test-file-url",
          userSigned: false,
          bandSigned: false,
          vidsignerDocGui: "test-doc-gui",
        },
      });

      const foundBooking = await repository.findByContractId(
        new ContractId(testContractId),
      );
      expect(foundBooking).toBeDefined();
      expect(foundBooking.toPrimitives().id).toBe(testBookingId);
    });
  });

  describe("findByInvoiceId", () => {
    it("should return booking for an invoice", async () => {
      const booking = new Booking(
        new BookingId(testBookingId),
        new BandId(testBandId),
        new UserId(testUserId),
        BookingStatus.PENDING,
        new Date("2024-12-31"),
        new Date("2025-01-01"),
        1000,
        "Test Event",
        "Test Country",
        "Test City",
        "Test Venue",
        "12345",
        "Test Address 1",
        "Test Address 2",
        testEventTypeId,
        true,
      );
      await repository.save(booking);

      await prismaService.contract.create({
        data: {
          id: testContractId,
          bookingId: testBookingId,
          status: "PENDING",
          fileUrl: "test-file-url",
          userSigned: false,
          bandSigned: false,
          vidsignerDocGui: "test-doc-gui",
        },
      });

      await prismaService.invoice.create({
        data: {
          id: testInvoiceId,
          contractId: testContractId,
          amount: 1000,
          status: "PENDING",
          fileUrl: "test-invoice-file-url",
        },
      });

      const foundBooking = await repository.findByInvoiceId(
        new InvoiceId(testInvoiceId),
      );
      expect(foundBooking).toBeDefined();
      expect(foundBooking.toPrimitives().id).toBe(testBookingId);
    });
  });
});

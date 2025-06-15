import { Test, TestingModule } from "@nestjs/testing";
import { GenerateInvoiceOnContractSignedEventHandler } from "../../../../src/context/invoice/service/generateInvoiceOnContractSigned.eventHandler";
import { InvoiceRepository } from "../../../../src/context/invoice/infrastructure/invoice.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { ContractSignedEvent } from "../../../../src/context/shared/eventBus/domain/contractSigned.event";
import { BookingNotFoundForContractIdException } from "../../../../src/context/invoice/exceptions/bookingNotFoundForContractIdException";
import { BandNotFoundException } from "../../../../src/context/invoice/exceptions/bandNotFoundException";
import { UserNotFoundForInvoiceException } from "../../../../src/context/invoice/exceptions/userNotFoundForInvoiceException";
import { UnableToCreateInvoiceException } from "../../../../src/context/invoice/exceptions/unableToCreateInvoiceException";
import { Invoice } from "../../../../src/context/invoice/domain/invoice";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import User from "../../../../src/context/shared/domain/user";
import { EXTERNAL_URL } from "../../../../src/config";
import { Role } from "../../../../src/context/shared/domain/role";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { WeeklyAvailability } from "../../../../src/context/band/domain/band";
import { BandSize } from "../../../../src/context/band/domain/bandSize";

describe("GenerateInvoiceOnContractSignedEventHandler", () => {
  let handler: GenerateInvoiceOnContractSignedEventHandler;
  let repository: jest.Mocked<InvoiceRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const contractId = ContractId.generate().toPrimitive();
  const bookingId = BookingId.generate().toPrimitive();
  const userId = UserId.generate().toPrimitive();
  const bandId = BandId.generate().toPrimitive();

  const mockBooking = {
    id: bookingId,
    userId: userId,
    bandId: bandId,
    status: BookingStatus.ACCEPTED,
    initDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    name: "Test Event",
    country: "Test Country",
    city: "Test City",
    venue: "Test Venue",
    postalCode: "12345",
    addressLine1: "123 Test St",
    addressLine2: "Apt 4B",
    eventTypeId: "event-type-1",
    isPublic: true,
    cost: 1000,
  };

  const mockBand = {
    id: bandId,
    name: "Test Band",
    members: [{ id: userId, role: BandRole.ADMIN }],
    musicalStyleIds: ["style-1"],
    reviewCount: 0,
    followers: 0,
    following: 0,
    createdAt: new Date(),
    price: 1000,
    location: "Test Location",
    bandSize: BandSize.BAND,
    eventTypeIds: ["event-type-1"],
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
    } as WeeklyAvailability,
    hospitalityRider: {
      accommodation: "Hotel room for each band member",
      catering: "Full board meals",
      beverages: "Water, soft drinks, and alcoholic beverages",
      specialRequirements: "Vegetarian options available",
    },
    technicalRider: {
      soundSystem: "Professional PA system",
      microphones: "2 microphones",
      backline: "Bass, keyboards",
      lighting: "Stage lighting",
      otherRequirements: "No loud amplification",
    },
    performanceArea: {
      regions: ["Barcelona", "Tarragona", "Girona"],
      travelPreferences: "Prefer venues within 100km radius",
      restrictions: "No outdoor events during winter",
    },
    media: [],
    socialLinks: [],
  };

  const mockUser = {
    id: userId,
    firstName: "John",
    familyName: "Doe",
    email: "john@example.com",
    role: Role.Client,
    emailVerified: true,
    joinedDate: new Date().toISOString(),
    phoneNumber: "123456789",
    nationalId: "12345678A",
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
    } as any;

    moduleConnectors = {
      getBookingByContractId: jest.fn(),
      getBandById: jest.fn(),
      obtainUserInformation: jest.fn(),
      storeFile: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateInvoiceOnContractSignedEventHandler,
        {
          provide: InvoiceRepository,
          useValue: repository,
        },
        {
          provide: ModuleConnectors,
          useValue: moduleConnectors,
        },
      ],
    }).compile();

    handler = module.get<GenerateInvoiceOnContractSignedEventHandler>(
      GenerateInvoiceOnContractSignedEventHandler,
    );
  });

  describe("handle", () => {
    it("should generate and store invoice when contract is signed", async () => {
      const event = new ContractSignedEvent(contractId);
      const user = User.fromPrimitives(mockUser);

      moduleConnectors.getBookingByContractId.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      moduleConnectors.obtainUserInformation.mockResolvedValue(user);
      moduleConnectors.storeFile.mockResolvedValue(undefined);

      const mockInvoice = Invoice.create(
        new ContractId(contractId),
        mockBand.price,
        `${EXTERNAL_URL}/files/invoice-${bookingId}-${Date.now()}.pdf`,
      );
      repository.create.mockResolvedValue(mockInvoice);

      await handler.handle(event);

      expect(moduleConnectors.getBookingByContractId).toHaveBeenCalledWith(
        contractId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(bandId);
      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        userId,
      );
      expect(moduleConnectors.storeFile).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalled();
    });

    it("should throw BookingNotFoundForContractIdException when booking is not found", async () => {
      const event = new ContractSignedEvent(contractId);

      moduleConnectors.getBookingByContractId.mockResolvedValue(undefined);

      await expect(handler.handle(event)).rejects.toThrow(
        BookingNotFoundForContractIdException,
      );
    });

    it("should throw BandNotFoundException when band is not found", async () => {
      const event = new ContractSignedEvent(contractId);

      moduleConnectors.getBookingByContractId.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(undefined);

      await expect(handler.handle(event)).rejects.toThrow(
        BandNotFoundException,
      );
    });

    it("should throw UserNotFoundForInvoiceException when user is not found", async () => {
      const event = new ContractSignedEvent(contractId);

      moduleConnectors.getBookingByContractId.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      moduleConnectors.obtainUserInformation.mockResolvedValue(undefined);

      await expect(handler.handle(event)).rejects.toThrow(
        UserNotFoundForInvoiceException,
      );
    });

    it("should throw UnableToCreateInvoiceException when invoice creation fails", async () => {
      const event = new ContractSignedEvent(contractId);
      const user = User.fromPrimitives(mockUser);

      moduleConnectors.getBookingByContractId.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      moduleConnectors.obtainUserInformation.mockResolvedValue(user);
      moduleConnectors.storeFile.mockResolvedValue(undefined);
      repository.create.mockResolvedValue(undefined);

      await expect(handler.handle(event)).rejects.toThrow(
        UnableToCreateInvoiceException,
      );
    });
  });
});

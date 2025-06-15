import { Test, TestingModule } from "@nestjs/testing";
import { InvoiceService } from "../../../../src/context/invoice/service/invoice.service";
import { InvoiceRepository } from "../../../../src/context/invoice/infrastructure/invoice.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { Invoice } from "../../../../src/context/invoice/domain/invoice";
import { Role } from "../../../../src/context/shared/domain/role";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { InvoiceStatus } from "../../../../src/context/invoice/domain/invoiceStatus";
import { InvoiceNotFoundException } from "../../../../src/context/invoice/exceptions/invoiceNotFoundException";
import { UnableToCreateInvoiceException } from "../../../../src/context/invoice/exceptions/unableToCreateInvoiceException";
import { NotOwnerOfTheRequestedInvoiceException } from "../../../../src/context/invoice/exceptions/notOwnerOfTheRequestedInvoiceException";
import { BookingNotFoundForContractIdException } from "../../../../src/context/invoice/exceptions/bookingNotFoundForContractIdException";
import { UnableToUpdateInvoiceException } from "../../../../src/context/invoice/exceptions/unableToUpdateInvoiceException";
import UserId from "../../../../src/context/shared/domain/userId";
import ContractId from "../../../../src/context/shared/domain/contractId";
import InvoiceId from "../../../../src/context/shared/domain/invoiceId";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import BandId from "../../../../src/context/shared/domain/bandId";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("InvoiceService", () => {
  let service: InvoiceService;
  let repository: jest.Mocked<InvoiceRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const userId = UserId.generate().toPrimitive();
  const contractId = ContractId.generate().toPrimitive();
  const invoiceId = InvoiceId.generate().toPrimitive();
  const bandId = BandId.generate().toPrimitive();

  const mockInvoice = {
    id: invoiceId,
    contractId: contractId,
    amount: 1000,
    status: InvoiceStatus.PENDING,
    fileUrl: "https://example.com/invoice.pdf",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findManyByUserId: jest.fn(),
      findBookingUserIdFromInvoiceId: jest.fn(),
      findBookingBandIdIdFromInvoiceId: jest.fn(),
      update: jest.fn(),
    } as any;

    moduleConnectors = {
      getBookingByContractId: jest.fn(),
      getBookingPrice: jest.fn(),
      obtainBandMembers: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
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

    service = module.get<InvoiceService>(InvoiceService);
  });

  describe("create", () => {
    it("should create a new invoice", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const createRequest = {
        contractId: contractId,
        fileUrl: "https://example.com/invoice.pdf",
      };

      const mockBooking = {
        id: BookingId.generate().toPrimitive(),
        userId: userId,
        bandId: bandId,
        status: BookingStatus.ACCEPTED,
        initDate: new Date(),
        endDate: new Date(),
        name: "Test Event",
        country: "Spain",
        city: "Barcelona",
        venue: "Test Venue",
        postalCode: "08001",
        addressLine1: "Test Street 1",
        addressLine2: "Test Floor 1",
        eventTypeId: "event-type-1",
        isPublic: true,
        cost: 1000,
      };

      moduleConnectors.getBookingByContractId.mockResolvedValue(mockBooking);
      moduleConnectors.getBookingPrice.mockResolvedValue(1000);
      moduleConnectors.obtainBandMembers.mockResolvedValue([userId]);

      const invoice = Invoice.create(
        new ContractId(contractId),
        1000,
        createRequest.fileUrl,
      );
      repository.create.mockResolvedValue(invoice);

      const result = await service.create(user, createRequest);

      expect(result).toEqual(invoice.toPrimitives());
      expect(repository.create).toHaveBeenCalledWith({
        ...invoice,
        id: expect.any(InvoiceId),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should throw BookingNotFoundForContractIdException when booking is not found", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const createRequest = {
        contractId: contractId,
        fileUrl: "https://example.com/invoice.pdf",
      };

      moduleConnectors.getBookingByContractId.mockResolvedValue(null);

      await expect(service.create(user, createRequest)).rejects.toThrow(
        new BookingNotFoundForContractIdException(contractId),
      );
    });

    it("should throw UnableToCreateInvoiceException when creation fails", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const createRequest = {
        contractId: contractId,
        fileUrl: "https://example.com/invoice.pdf",
      };

      const mockBooking = {
        id: BookingId.generate().toPrimitive(),
        userId: userId,
        bandId: bandId,
        status: BookingStatus.ACCEPTED,
        initDate: new Date(),
        endDate: new Date(),
        name: "Test Event",
        country: "Spain",
        city: "Barcelona",
        venue: "Test Venue",
        postalCode: "08001",
        addressLine1: "Test Street 1",
        addressLine2: "Test Floor 1",
        eventTypeId: "event-type-1",
        isPublic: true,
        cost: 1000,
      };

      moduleConnectors.getBookingByContractId.mockResolvedValue(mockBooking);
      moduleConnectors.getBookingPrice.mockResolvedValue(1000);
      moduleConnectors.obtainBandMembers.mockResolvedValue([userId]);
      repository.create.mockResolvedValue(null);

      await expect(service.create(user, createRequest)).rejects.toThrow(
        new UnableToCreateInvoiceException(),
      );
    });
  });

  describe("update", () => {
    it("should update an invoice status", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const updateRequest = {
        id: invoiceId,
        status: InvoiceStatus.PAID,
      };

      const existingInvoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(existingInvoice);
      repository.findBookingUserIdFromInvoiceId.mockResolvedValue(userId);

      const updatedInvoice = Invoice.fromPrimitives({
        ...mockInvoice,
        status: InvoiceStatus.PAID,
      });
      repository.update.mockResolvedValue(updatedInvoice);

      const result = await service.update(user, updateRequest);

      expect(result).toEqual(updatedInvoice.toPrimitives());
      expect(repository.update).toHaveBeenCalledWith(updatedInvoice);
    });

    it("should throw InvoiceNotFoundException when invoice is not found", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const updateRequest = {
        id: invoiceId,
        status: InvoiceStatus.PAID,
      };

      repository.findById.mockResolvedValue(undefined);

      await expect(service.update(user, updateRequest)).rejects.toThrow(
        new InvoiceNotFoundException(),
      );
    });

    it("should throw NotOwnerOfTheRequestedInvoiceException when user is not the owner", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const updateRequest = {
        id: invoiceId,
        status: InvoiceStatus.PAID,
      };

      const existingInvoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(existingInvoice);
      repository.findBookingUserIdFromInvoiceId.mockResolvedValue(
        "other-user-id",
      );

      await expect(service.update(user, updateRequest)).rejects.toThrow(
        new NotOwnerOfTheRequestedInvoiceException(invoiceId),
      );
    });

    it("should throw UnableToUpdateInvoiceException when update fails", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const updateRequest = {
        id: invoiceId,
        status: InvoiceStatus.PAID,
      };

      const existingInvoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(existingInvoice);
      repository.findBookingUserIdFromInvoiceId.mockResolvedValue(userId);
      repository.update.mockResolvedValue(undefined);

      await expect(service.update(user, updateRequest)).rejects.toThrow(
        new UnableToUpdateInvoiceException(),
      );
    });
  });

  describe("findById", () => {
    it("should return an invoice by id", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const invoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(invoice);
      repository.findBookingUserIdFromInvoiceId.mockResolvedValue(userId);

      const result = await service.findById(user, invoiceId);

      expect(result).toEqual(mockInvoice);
      expect(repository.findById).toHaveBeenCalledWith(
        new InvoiceId(invoiceId),
      );
    });

    it("should throw InvoiceNotFoundException when invoice is not found", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      repository.findById.mockResolvedValue(undefined);

      await expect(service.findById(user, invoiceId)).rejects.toThrow(
        new InvoiceNotFoundException(),
      );
    });

    it("should throw NotOwnerOfTheRequestedInvoiceException when user is not the owner", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const invoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(invoice);
      repository.findBookingUserIdFromInvoiceId.mockResolvedValue(
        "other-user-id",
      );

      await expect(service.findById(user, invoiceId)).rejects.toThrow(
        new NotOwnerOfTheRequestedInvoiceException(invoiceId),
      );
    });
  });

  describe("findManyByUserId", () => {
    it("should return all invoices for a user", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const invoices = [Invoice.fromPrimitives(mockInvoice)];
      repository.findManyByUserId.mockResolvedValue(invoices);

      const result = await service.findManyByUserId(user);

      expect(result).toEqual([mockInvoice]);
      expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);
    });
  });
});

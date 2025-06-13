import { Test, TestingModule } from "@nestjs/testing";
import { PayInvoiceCommandHandler } from "../../../../src/context/invoice/service/payInvoice.commandHandler";
import { InvoiceRepository } from "../../../../src/context/invoice/infrastructure/invoice.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { EventBus } from "../../../../src/context/shared/eventBus/domain/eventBus";
import { PayInvoiceCommand } from "../../../../src/context/invoice/service/payInvoice.command";
import { Role } from "../../../../src/context/shared/domain/role";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Invoice } from "../../../../src/context/invoice/domain/invoice";
import { InvoiceStatus } from "../../../../src/context/invoice/domain/invoiceStatus";
import { UnauthorizedRoleException } from "../../../../src/context/invoice/exceptions/unauthorizedRoleException";
import { BandNotFoundForInvoiceException } from "../../../../src/context/invoice/exceptions/bandNotFoundForInvoiceException";
import { NotBandMemberException } from "../../../../src/context/invoice/exceptions/notBandMemberException";
import { InvoiceNotFoundException } from "../../../../src/context/invoice/exceptions/invoiceNotFoundException";
import { UnableToUpdateInvoiceException } from "../../../../src/context/invoice/exceptions/unableToUpdateInvoiceException";
import { BookingIdNotFoundForInvoiceIdException } from "../../../../src/context/invoice/exceptions/bookingIdNotFoundForInvoiceIdException";
import { InvoicePaidEvent } from "../../../../src/context/shared/eventBus/domain/invoicePaid.event";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import InvoiceId from "../../../../src/context/shared/domain/invoiceId";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("PayInvoiceCommandHandler", () => {
  let handler: PayInvoiceCommandHandler;
  let repository: jest.Mocked<InvoiceRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;
  let eventBus: jest.Mocked<EventBus>;

  const userId = UserId.generate().toPrimitive();
  const bandId = BandId.generate().toPrimitive();
  const invoiceId = InvoiceId.generate().toPrimitive();
  const contractId = ContractId.generate().toPrimitive();
  const bookingId = BookingId.generate().toPrimitive();

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
      getBandIdByInvoiceId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      getBookingIdByInvoiceId: jest.fn(),
    } as any;

    moduleConnectors = {
      obtainBandMembers: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayInvoiceCommandHandler,
        {
          provide: InvoiceRepository,
          useValue: repository,
        },
        {
          provide: ModuleConnectors,
          useValue: moduleConnectors,
        },
        {
          provide: "EventBus",
          useValue: eventBus,
        },
      ],
    }).compile();

    handler = module.get<PayInvoiceCommandHandler>(PayInvoiceCommandHandler);
  });

  describe("execute", () => {
    it("should pay an invoice successfully", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const command = new PayInvoiceCommand(invoiceId, user);

      repository.getBandIdByInvoiceId.mockResolvedValue(new BandId(bandId));
      moduleConnectors.obtainBandMembers.mockResolvedValue([userId]);

      const invoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(invoice);

      const updatedInvoice = Invoice.fromPrimitives({
        ...mockInvoice,
        status: InvoiceStatus.PAID,
      });
      repository.update.mockResolvedValue(updatedInvoice);
      repository.getBookingIdByInvoiceId.mockResolvedValue(
        new BookingId(bookingId),
      );

      await handler.execute(command);

      expect(repository.update).toHaveBeenCalledWith(updatedInvoice);
      expect(eventBus.publish).toHaveBeenCalledWith({
        ...new InvoicePaidEvent(invoiceId),
        id: expect.any(String),
        timestamp: expect.any(Date),
      });
    });

    it("should throw UnauthorizedRoleException when user is not a musician", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Client,
      };

      const command = new PayInvoiceCommand(invoiceId, user);

      await expect(handler.execute(command)).rejects.toThrow(
        new UnauthorizedRoleException(Role.Client),
      );
    });

    it("should throw BandNotFoundForInvoiceException when band is not found", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const command = new PayInvoiceCommand(invoiceId, user);

      repository.getBandIdByInvoiceId.mockResolvedValue(undefined);

      await expect(handler.execute(command)).rejects.toThrow(
        new BandNotFoundForInvoiceException(invoiceId),
      );
    });

    it("should throw NotBandMemberException when user is not a band member", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const command = new PayInvoiceCommand(invoiceId, user);

      repository.getBandIdByInvoiceId.mockResolvedValue(new BandId(bandId));
      moduleConnectors.obtainBandMembers.mockResolvedValue(["other-user-id"]);

      await expect(handler.execute(command)).rejects.toThrow(
        new NotBandMemberException(),
      );
    });

    it("should throw InvoiceNotFoundException when invoice is not found", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const command = new PayInvoiceCommand(invoiceId, user);

      repository.getBandIdByInvoiceId.mockResolvedValue(new BandId(bandId));
      moduleConnectors.obtainBandMembers.mockResolvedValue([userId]);
      repository.findById.mockResolvedValue(undefined);

      await expect(handler.execute(command)).rejects.toThrow(
        new InvoiceNotFoundException(),
      );
    });

    it("should throw UnableToUpdateInvoiceException when update fails", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const command = new PayInvoiceCommand(invoiceId, user);

      repository.getBandIdByInvoiceId.mockResolvedValue(new BandId(bandId));
      moduleConnectors.obtainBandMembers.mockResolvedValue([userId]);

      const invoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(invoice);
      repository.update.mockResolvedValue(undefined);

      await expect(handler.execute(command)).rejects.toThrow(
        new UnableToUpdateInvoiceException(),
      );
    });

    it("should throw BookingIdNotFoundForInvoiceIdException when booking is not found", async () => {
      const user: UserAuthInfo = {
        id: userId,
        email: "test@example.com",
        role: Role.Musician,
      };

      const command = new PayInvoiceCommand(invoiceId, user);

      repository.getBandIdByInvoiceId.mockResolvedValue(new BandId(bandId));
      moduleConnectors.obtainBandMembers.mockResolvedValue([userId]);

      const invoice = Invoice.fromPrimitives(mockInvoice);
      repository.findById.mockResolvedValue(invoice);

      const updatedInvoice = Invoice.fromPrimitives({
        ...mockInvoice,
        status: InvoiceStatus.PAID,
      });
      repository.update.mockResolvedValue(updatedInvoice);
      repository.getBookingIdByInvoiceId.mockResolvedValue(undefined);

      await expect(handler.execute(command)).rejects.toThrow(
        new BookingIdNotFoundForInvoiceIdException(invoiceId),
      );
    });
  });
});

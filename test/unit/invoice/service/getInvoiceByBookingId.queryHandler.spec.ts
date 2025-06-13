import { Test, TestingModule } from "@nestjs/testing";
import { GetInvoiceByBookingIdQueryHandler } from "../../../../src/context/invoice/service/getInvoiceByBookingId.queryHandler";
import { InvoiceRepository } from "../../../../src/context/invoice/infrastructure/invoice.repository";
import { GetInvoiceByBookingIdQuery } from "../../../../src/context/invoice/service/getInvoiceByBookingId.query";
import { Invoice } from "../../../../src/context/invoice/domain/invoice";
import { InvoiceStatus } from "../../../../src/context/invoice/domain/invoiceStatus";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import ContractId from "../../../../src/context/shared/domain/contractId";
import InvoiceId from "../../../../src/context/shared/domain/invoiceId";

describe("GetInvoiceByBookingIdQueryHandler", () => {
  let handler: GetInvoiceByBookingIdQueryHandler;
  let repository: jest.Mocked<InvoiceRepository>;

  const bookingId = BookingId.generate().toPrimitive();
  const invoiceId = InvoiceId.generate().toPrimitive();
  const contractId = ContractId.generate().toPrimitive();

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
      findByBookingId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetInvoiceByBookingIdQueryHandler,
        {
          provide: InvoiceRepository,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<GetInvoiceByBookingIdQueryHandler>(
      GetInvoiceByBookingIdQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return invoice primitives when invoice is found", async () => {
      const query = new GetInvoiceByBookingIdQuery(bookingId);

      const invoice = Invoice.fromPrimitives(mockInvoice);
      repository.findByBookingId.mockResolvedValue(invoice);

      const result = await handler.execute(query);

      expect(result).toEqual(mockInvoice);
      expect(repository.findByBookingId).toHaveBeenCalledWith(
        new BookingId(bookingId),
      );
    });

    it("should return undefined when no invoice is found", async () => {
      const query = new GetInvoiceByBookingIdQuery(bookingId);

      repository.findByBookingId.mockResolvedValue(undefined);

      const result = await handler.execute(query);

      expect(result).toBeUndefined();
      expect(repository.findByBookingId).toHaveBeenCalledWith(
        new BookingId(bookingId),
      );
    });
  });
});

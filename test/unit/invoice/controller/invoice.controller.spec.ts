import { Test, TestingModule } from "@nestjs/testing";
import { InvoiceController } from "../../../../src/app/api/invoice/invoice.controller";
import { InvoiceService } from "../../../../src/context/invoice/service/invoice.service";
import { CommandBus } from "@nestjs/cqrs";
import { CreateInvoiceRequestDto } from "../../../../src/app/api/invoice/createInvoiceRequest.dto";
import { UpdateInvoiceRequestDto } from "../../../../src/app/api/invoice/updateInvoiceRequest.dto";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { InvoiceStatus } from "../../../../src/context/invoice/domain/invoiceStatus";
import { PayInvoiceCommand } from "../../../../src/context/invoice/service/payInvoice.command";

interface InvoiceResponseDto {
  id: string;
  contractId: string;
  amount: number;
  status: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

describe("InvoiceController", () => {
  let controller: InvoiceController;

  const mockInvoiceService = {
    create: jest.fn(),
    findManyByUserId: jest.fn(),
    findManyByBand: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: InvoiceService,
          useValue: mockInvoiceService,
        },
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new invoice", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const createInvoiceDto: CreateInvoiceRequestDto = {
        contractId: "contract-123",
        fileUrl: "https://example.com/invoice.pdf",
      };

      const expectedResponse: InvoiceResponseDto = {
        id: "1",
        contractId: "contract-123",
        amount: 1000,
        status: InvoiceStatus.PENDING,
        fileUrl: "https://example.com/invoice.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvoiceService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(
        { user: mockUser },
        createInvoiceDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockInvoiceService.create).toHaveBeenCalledWith(
        mockUser,
        createInvoiceDto,
      );
    });
  });

  describe("findAllByUser", () => {
    it("should return all invoices for a user", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const expectedResponse: InvoiceResponseDto[] = [
        {
          id: "1",
          contractId: "contract-123",
          amount: 1000,
          status: InvoiceStatus.PENDING,
          fileUrl: "https://example.com/invoice.pdf",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInvoiceService.findManyByUserId.mockResolvedValue(expectedResponse);

      const result = await controller.findAllByUser({ user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockInvoiceService.findManyByUserId).toHaveBeenCalledWith(
        mockUser,
      );
    });
  });

  describe("findAllByBand", () => {
    it("should return all invoices for a band", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const bandId = "band-123";

      const expectedResponse: InvoiceResponseDto[] = [
        {
          id: "1",
          contractId: "contract-123",
          amount: 1000,
          status: InvoiceStatus.PENDING,
          fileUrl: "https://example.com/invoice.pdf",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockInvoiceService.findManyByBand.mockResolvedValue(expectedResponse);

      const result = await controller.findAllByBand({ user: mockUser }, bandId);

      expect(result).toEqual(expectedResponse);
      expect(mockInvoiceService.findManyByBand).toHaveBeenCalledWith(
        mockUser,
        bandId,
      );
    });
  });

  describe("findById", () => {
    it("should return an invoice by id", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const invoiceId = "1";

      const expectedResponse: InvoiceResponseDto = {
        id: "1",
        contractId: "contract-123",
        amount: 1000,
        status: InvoiceStatus.PENDING,
        fileUrl: "https://example.com/invoice.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvoiceService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById({ user: mockUser }, invoiceId);

      expect(result).toEqual(expectedResponse);
      expect(mockInvoiceService.findById).toHaveBeenCalledWith(
        mockUser,
        invoiceId,
      );
    });
  });

  describe("payInvoice", () => {
    it("should execute pay invoice command", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const invoiceId = "1";

      mockCommandBus.execute.mockResolvedValue(undefined);

      await controller.payInvoice({ user: mockUser }, invoiceId);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(PayInvoiceCommand),
      );
      expect(mockCommandBus.execute.mock.calls[0][0]).toBeInstanceOf(
        PayInvoiceCommand,
      );
      expect(mockCommandBus.execute.mock.calls[0][0]).toStrictEqual(
        new PayInvoiceCommand(invoiceId, mockUser),
      );
    });
  });

  describe("update", () => {
    it("should update an invoice", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const invoiceId = "1";

      const updateInvoiceDto: UpdateInvoiceRequestDto = {
        status: InvoiceStatus.PAID,
      };

      const expectedResponse: InvoiceResponseDto = {
        id: "1",
        contractId: "contract-123",
        amount: 1000,
        status: InvoiceStatus.PAID,
        fileUrl: "https://example.com/invoice.pdf",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockInvoiceService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        { user: mockUser },
        updateInvoiceDto,
        invoiceId,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockInvoiceService.update).toHaveBeenCalledWith(mockUser, {
        ...updateInvoiceDto,
        id: invoiceId,
      });
    });
  });

  describe("delete", () => {
    it("should delete an invoice", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const invoiceId = "1";

      mockInvoiceService.delete.mockResolvedValue(undefined);

      await controller.delete({ user: mockUser }, invoiceId);

      expect(mockInvoiceService.delete).toHaveBeenCalledWith(
        mockUser,
        invoiceId,
      );
    });
  });
});

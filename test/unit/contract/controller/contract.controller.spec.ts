import { Test, TestingModule } from "@nestjs/testing";
import { ContractController } from "../../../../src/app/api/contract/contract.controller";
import { ContractService } from "../../../../src/context/contract/service/contract.service";
import { CommandBus } from "@nestjs/cqrs";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { UpdateContractRequestDto } from "../../../../src/app/api/contract/updateContractRequest.dto";
import { SignatureNotificationRequestDto } from "../../../../src/app/api/contract/signatureNotificationRequest.dto";
import { ContractStatus } from "../../../../src/context/contract/domain/contractStatus";
import { ProcessSignatureNotificationCommand } from "../../../../src/context/contract/service/processSignatureNotification.command";

describe("ContractController", () => {
  let controller: ContractController;

  const mockContractService = {
    findManyByUserId: jest.fn(),
    findManyByBand: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockUser: UserAuthInfo = {
    id: "1",
    email: "test@example.com",
    role: Role.Client,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContractController],
      providers: [
        {
          provide: ContractService,
          useValue: mockContractService,
        },
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<ContractController>(ContractController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAllByUser", () => {
    it("should return all contracts for a user", async () => {
      const expectedResponse = [
        {
          id: "1",
          bookingId: "booking-1",
          status: ContractStatus.PENDING,
          fileUrl: "https://example.com/contract1.pdf",
          userSigned: false,
          bandSigned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          eventName: "Wedding",
          bandName: "The Band",
          userName: "John Doe",
          eventDate: new Date(),
        },
      ];

      mockContractService.findManyByUserId.mockResolvedValue(expectedResponse);

      const result = await controller.findAllByUser({ user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockContractService.findManyByUserId).toHaveBeenCalledWith(
        mockUser,
      );
    });
  });

  describe("findAllByBand", () => {
    it("should return all contracts for a band", async () => {
      const bandId = "band-1";
      const expectedResponse = [
        {
          id: "1",
          bookingId: "booking-1",
          status: ContractStatus.PENDING,
          fileUrl: "https://example.com/contract1.pdf",
          userSigned: false,
          bandSigned: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          eventName: "Wedding",
          bandName: "The Band",
          userName: "John Doe",
          eventDate: new Date(),
        },
      ];

      mockContractService.findManyByBand.mockResolvedValue(expectedResponse);

      const result = await controller.findAllByBand({ user: mockUser }, bandId);

      expect(result).toEqual(expectedResponse);
      expect(mockContractService.findManyByBand).toHaveBeenCalledWith(
        mockUser,
        bandId,
      );
    });
  });

  describe("processNotification", () => {
    it("should process signature notification", async () => {
      const contractId = "1";
      const notificationDto: SignatureNotificationRequestDto = {
        Signers: [
          {
            SignerGUI: "signer-1",
            SignerName: "John Doe",
            SignatureStatus: "SIGNED",
            TypeOfID: "PASSPORT",
            NumberID: "123456789",
            OperationTime: "2024-03-20T10:00:00Z",
          },
        ],
        FileName: "contract.pdf",
        DocGUI: "doc-1",
        DocStatus: "COMPLETED",
        Downloaded: true,
      };

      await controller.processNotification(notificationDto, contractId);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(ProcessSignatureNotificationCommand),
      );
      const command = mockCommandBus.execute.mock.calls[0][0];
      expect(command).toBeInstanceOf(ProcessSignatureNotificationCommand);
      expect(command.Signers).toEqual(notificationDto.Signers);
      expect(command.FileName).toBe(notificationDto.FileName);
      expect(command.DocGUI).toBe(notificationDto.DocGUI);
      expect(command.DocStatus).toBe(notificationDto.DocStatus);
      expect(command.Downloaded).toBe(notificationDto.Downloaded);
    });
  });

  describe("findById", () => {
    it("should return a contract by id", async () => {
      const contractId = "1";
      const expectedResponse = {
        id: contractId,
        bookingId: "booking-1",
        status: ContractStatus.PENDING,
        fileUrl: "https://example.com/contract1.pdf",
        userSigned: false,
        bandSigned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        eventName: "Wedding",
        bandName: "The Band",
        userName: "John Doe",
        eventDate: new Date(),
      };

      mockContractService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById({ user: mockUser }, contractId);

      expect(result).toEqual(expectedResponse);
      expect(mockContractService.findById).toHaveBeenCalledWith(
        mockUser,
        contractId,
      );
    });
  });

  describe("update", () => {
    it("should update a contract", async () => {
      const contractId = "1";
      const updateDto: UpdateContractRequestDto = {
        status: ContractStatus.SIGNED,
        fileUrl: "https://example.com/updated-contract.pdf",
      };

      const expectedResponse = {
        id: contractId,
        bookingId: "booking-1",
        ...updateDto,
        userSigned: true,
        bandSigned: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        eventName: "Wedding",
        bandName: "The Band",
        userName: "John Doe",
        eventDate: new Date(),
      };

      mockContractService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        { user: mockUser },
        updateDto,
        contractId,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockContractService.update).toHaveBeenCalledWith(mockUser, {
        ...updateDto,
        id: contractId,
      });
    });
  });

  describe("delete", () => {
    it("should delete a contract", async () => {
      const contractId = "1";

      await controller.delete({ user: mockUser }, contractId);

      expect(mockContractService.delete).toHaveBeenCalledWith(
        mockUser,
        contractId,
      );
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { ProcessSignatureNotificationCommandHandler } from "../../../../src/context/contract/service/processSignatureNotification.commandHandler";
import { ProcessSignatureNotificationCommand } from "../../../../src/context/contract/service/processSignatureNotification.command";
import { ContractRepository } from "../../../../src/context/contract/infrastructure/contract.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import {
  DocumentStatus,
  VidsignerApiWrapper,
} from "../../../../src/context/contract/infrastructure/vidsignerApiWrapper";
import { EventBus } from "../../../../src/context/shared/eventBus/domain/eventBus";
import { Contract } from "../../../../src/context/contract/domain/contract";
import { ContractStatus } from "../../../../src/context/contract/domain/contractStatus";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import { UserSignedContractEvent } from "../../../../src/context/shared/eventBus/domain/userSignedContract.event";
import { BandSignedContractEvent } from "../../../../src/context/shared/eventBus/domain/bandSignedContract.event";
import { ContractSignedEvent } from "../../../../src/context/shared/eventBus/domain/contractSigned.event";
import { EXTERNAL_URL } from "../../../../src/config";

describe("ProcessSignatureNotificationCommandHandler", () => {
  let handler: ProcessSignatureNotificationCommandHandler;
  let contractRepository: jest.Mocked<ContractRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;
  let vidSignerApiWrapper: jest.Mocked<VidsignerApiWrapper>;
  let eventBus: jest.Mocked<EventBus>;

  const mockContractId = ContractId.generate().toPrimitive();
  const mockBookingId = BookingId.generate().toPrimitive();
  const mockDocGui = "test-doc-gui";
  const mockFileName = "test-file.pdf";
  const mockFileContent = Buffer.from("test file content");

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessSignatureNotificationCommandHandler,
        {
          provide: ContractRepository,
          useValue: {
            findByVidSignerDocGui: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ModuleConnectors,
          useValue: {
            storeFile: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: VidsignerApiWrapper,
          useValue: {
            getDocument: jest.fn(),
          },
        },
        {
          provide: "EventBus",
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get<ProcessSignatureNotificationCommandHandler>(
      ProcessSignatureNotificationCommandHandler,
    );
    contractRepository = module.get(ContractRepository);
    moduleConnectors = module.get(ModuleConnectors);
    vidSignerApiWrapper = module.get(VidsignerApiWrapper);
    eventBus = module.get("EventBus");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should do nothing when contract is not found", async () => {
    contractRepository.findByVidSignerDocGui.mockResolvedValue(undefined);

    const command = new ProcessSignatureNotificationCommand(
      [],
      mockFileName,
      mockDocGui,
      DocumentStatus.Signed,
      false,
    );

    await handler.execute(command);

    expect(contractRepository.findByVidSignerDocGui).toHaveBeenCalledWith(
      mockDocGui,
    );
    expect(contractRepository.update).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("should process user signature", async () => {
    const mockContract = {
      setUserSigned: jest.fn(),
      setBandSigned: jest.fn(),
      failedSignature: jest.fn(),
      updateFileUrl: jest.fn(),
      getId: jest.fn().mockReturnValue({ toPrimitive: () => mockContractId }),
      getBookingId: jest
        .fn()
        .mockReturnValue({ toPrimitive: () => mockBookingId }),
      toPrimitives: jest.fn().mockReturnValue({
        id: mockContractId,
        bookingId: mockBookingId,
        status: ContractStatus.PENDING,
        fileUrl: "old-file-url",
        userSigned: false,
        bandSigned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        vidsignerDocGui: mockDocGui,
        userName: "Test User",
        bandName: "Test Band",
        eventName: "Test Event",
      }),
      isUserSigned: jest.fn().mockReturnValue(false),
      isBandSigned: jest.fn().mockReturnValue(false),
    } as unknown as Contract;

    contractRepository.findByVidSignerDocGui.mockResolvedValue(mockContract);
    vidSignerApiWrapper.getDocument.mockResolvedValue(mockFileContent);

    const command = new ProcessSignatureNotificationCommand(
      [
        {
          SignerGUI: "user-signer-gui",
          SignerName: "Test User",
          SignatureStatus: DocumentStatus.Signed,
          TypeOfID: "DNI",
          NumberID: "12345678A",
          OperationTime: new Date().toISOString(),
        },
      ],
      mockFileName,
      mockDocGui,
      DocumentStatus.Signed,
      false,
    );

    await handler.execute(command);

    expect(contractRepository.findByVidSignerDocGui).toHaveBeenCalledWith(
      mockDocGui,
    );
    expect(mockContract.setUserSigned).toHaveBeenCalled();
    expect(vidSignerApiWrapper.getDocument).toHaveBeenCalledWith(mockDocGui);
    expect(moduleConnectors.storeFile).toHaveBeenCalled();
    expect(mockContract.updateFileUrl).toHaveBeenCalledWith(
      expect.stringContaining(
        `${EXTERNAL_URL}/files/contract-${mockBookingId}-`,
      ),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(UserSignedContractEvent),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(ContractSignedEvent),
    );
  });

  it("should process band signature", async () => {
    const mockContract = {
      setUserSigned: jest.fn(),
      setBandSigned: jest.fn(),
      failedSignature: jest.fn(),
      updateFileUrl: jest.fn(),
      getId: jest.fn().mockReturnValue({ toPrimitive: () => mockContractId }),
      getBookingId: jest
        .fn()
        .mockReturnValue({ toPrimitive: () => mockBookingId }),
      toPrimitives: jest.fn().mockReturnValue({
        id: mockContractId,
        bookingId: mockBookingId,
        status: ContractStatus.PENDING,
        fileUrl: "old-file-url",
        userSigned: true,
        bandSigned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        vidsignerDocGui: mockDocGui,
        userName: "Test User",
        bandName: "Test Band",
        eventName: "Test Event",
      }),
      isUserSigned: jest.fn().mockReturnValue(true),
      isBandSigned: jest.fn().mockReturnValue(false),
    } as unknown as Contract;

    contractRepository.findByVidSignerDocGui.mockResolvedValue(mockContract);
    vidSignerApiWrapper.getDocument.mockResolvedValue(mockFileContent);

    const command = new ProcessSignatureNotificationCommand(
      [
        {
          SignerGUI: "band-signer-gui",
          SignerName: "Test Band",
          SignatureStatus: DocumentStatus.Signed,
          TypeOfID: "DNI",
          NumberID: "87654321B",
          OperationTime: new Date().toISOString(),
        },
      ],
      mockFileName,
      mockDocGui,
      DocumentStatus.Signed,
      false,
    );

    await handler.execute(command);

    expect(contractRepository.findByVidSignerDocGui).toHaveBeenCalledWith(
      mockDocGui,
    );
    expect(mockContract.setBandSigned).toHaveBeenCalled();
    expect(vidSignerApiWrapper.getDocument).toHaveBeenCalledWith(mockDocGui);
    expect(moduleConnectors.storeFile).toHaveBeenCalled();
    expect(mockContract.updateFileUrl).toHaveBeenCalledWith(
      expect.stringContaining(
        `${EXTERNAL_URL}/files/contract-${mockBookingId}-`,
      ),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(BandSignedContractEvent),
    );
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.any(ContractSignedEvent),
    );
  });

  it("should handle rejected signature", async () => {
    const mockContract = {
      setUserSigned: jest.fn(),
      setBandSigned: jest.fn(),
      failedSignature: jest.fn(),
      updateFileUrl: jest.fn(),
      getId: jest.fn().mockReturnValue({ toPrimitive: () => mockContractId }),
      getBookingId: jest
        .fn()
        .mockReturnValue({ toPrimitive: () => mockBookingId }),
      toPrimitives: jest.fn().mockReturnValue({
        id: mockContractId,
        bookingId: mockBookingId,
        status: ContractStatus.PENDING,
        fileUrl: "old-file-url",
        userSigned: false,
        bandSigned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        vidsignerDocGui: mockDocGui,
        userName: "Test User",
        bandName: "Test Band",
        eventName: "Test Event",
      }),
      isUserSigned: jest.fn().mockReturnValue(false),
      isBandSigned: jest.fn().mockReturnValue(false),
    } as unknown as Contract;

    contractRepository.findByVidSignerDocGui.mockResolvedValue(mockContract);

    const command = new ProcessSignatureNotificationCommand(
      [
        {
          SignerGUI: "user-signer-gui",
          SignerName: "Test User",
          SignatureStatus: DocumentStatus.Rejected,
          TypeOfID: "DNI",
          NumberID: "12345678A",
          OperationTime: new Date().toISOString(),
          RejectionReason: "User rejected",
        },
      ],
      mockFileName,
      mockDocGui,
      DocumentStatus.Rejected,
      false,
    );

    await handler.execute(command);

    expect(contractRepository.findByVidSignerDocGui).toHaveBeenCalledWith(
      mockDocGui,
    );
    expect(mockContract.failedSignature).toHaveBeenCalled();
    expect(vidSignerApiWrapper.getDocument).not.toHaveBeenCalled();
    expect(moduleConnectors.storeFile).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it("should not process already signed signatures", async () => {
    const signedContract = {
      setUserSigned: jest.fn(),
      setBandSigned: jest.fn(),
      failedSignature: jest.fn(),
      updateFileUrl: jest.fn(),
      getId: jest.fn().mockReturnValue({ toPrimitive: () => mockContractId }),
      getBookingId: jest
        .fn()
        .mockReturnValue({ toPrimitive: () => mockBookingId }),
      toPrimitives: jest.fn().mockReturnValue({
        id: mockContractId,
        bookingId: mockBookingId,
        status: ContractStatus.SIGNED,
        fileUrl: "existing-file-url",
        userSigned: true,
        bandSigned: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        vidsignerDocGui: mockDocGui,
        userName: "Test User",
        bandName: "Test Band",
        eventName: "Test Event",
      }),
      isUserSigned: jest.fn().mockReturnValue(true),
      isBandSigned: jest.fn().mockReturnValue(true),
    } as unknown as Contract;

    contractRepository.findByVidSignerDocGui.mockResolvedValue(signedContract);

    const command = new ProcessSignatureNotificationCommand(
      [
        {
          SignerGUI: "user-signer-gui",
          SignerName: "Test User",
          SignatureStatus: DocumentStatus.Signed,
          TypeOfID: "DNI",
          NumberID: "12345678A",
          OperationTime: new Date().toISOString(),
        },
        {
          SignerGUI: "band-signer-gui",
          SignerName: "Test Band",
          SignatureStatus: DocumentStatus.Signed,
          TypeOfID: "DNI",
          NumberID: "87654321B",
          OperationTime: new Date().toISOString(),
        },
      ],
      mockFileName,
      mockDocGui,
      DocumentStatus.Signed,
      false,
    );

    await handler.execute(command);

    expect(contractRepository.findByVidSignerDocGui).toHaveBeenCalledWith(
      mockDocGui,
    );
    expect(signedContract.setUserSigned).not.toHaveBeenCalled();
    expect(signedContract.setBandSigned).not.toHaveBeenCalled();
    expect(vidSignerApiWrapper.getDocument).not.toHaveBeenCalled();
    expect(moduleConnectors.storeFile).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
 
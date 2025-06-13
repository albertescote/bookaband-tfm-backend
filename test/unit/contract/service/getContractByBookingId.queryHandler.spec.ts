import { Test, TestingModule } from "@nestjs/testing";
import { GetContractByBookingIdQueryHandler } from "../../../../src/context/contract/service/getContractByBookingId.queryHandler";
import { GetContractByBookingIdQuery } from "../../../../src/context/contract/service/getContractByBookingId.query";
import { ContractRepository } from "../../../../src/context/contract/infrastructure/contract.repository";
import { Contract } from "../../../../src/context/contract/domain/contract";
import { ContractStatus } from "../../../../src/context/contract/domain/contractStatus";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("GetContractByBookingIdQueryHandler", () => {
  let handler: GetContractByBookingIdQueryHandler;
  let contractRepository: jest.Mocked<ContractRepository>;

  const mockBookingId = BookingId.generate().toPrimitive();
  const mockContractId = ContractId.generate().toPrimitive();
  const mockFileUrl = "test-file-url";
  const mockVidsignerDocGui = "test-doc-gui";
  const mockEventName = "Test Event";
  const mockBandName = "Test Band";
  const mockUserName = "Test User";
  const mockEventDate = new Date();

  const mockContract = {
    id: new ContractId(mockContractId),
    bookingId: new BookingId(mockBookingId),
    status: ContractStatus.PENDING,
    fileUrl: mockFileUrl,
    userSigned: false,
    bandSigned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    vidsignerDocGui: mockVidsignerDocGui,
    eventName: mockEventName,
    bandName: mockBandName,
    userName: mockUserName,
    eventDate: mockEventDate,
    toPrimitives: jest.fn().mockReturnValue({
      id: mockContractId,
      bookingId: mockBookingId,
      status: ContractStatus.PENDING,
      fileUrl: mockFileUrl,
      userSigned: false,
      bandSigned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      vidsignerDocGui: mockVidsignerDocGui,
      eventName: mockEventName,
      bandName: mockBandName,
      userName: mockUserName,
      eventDate: mockEventDate,
    }),
  } as unknown as Contract;

  beforeEach(async () => {
    contractRepository = {
      findByBookingId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetContractByBookingIdQueryHandler,
        {
          provide: ContractRepository,
          useValue: contractRepository,
        },
      ],
    }).compile();

    handler = module.get<GetContractByBookingIdQueryHandler>(
      GetContractByBookingIdQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return contract primitives when contract exists", async () => {
      contractRepository.findByBookingId.mockResolvedValue(mockContract);

      const query = new GetContractByBookingIdQuery(mockBookingId);
      const result = await handler.execute(query);

      expect(contractRepository.findByBookingId).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
      expect(result).toEqual(mockContract.toPrimitives());
    });

    it("should return undefined when contract does not exist", async () => {
      contractRepository.findByBookingId.mockResolvedValue(undefined);

      const query = new GetContractByBookingIdQuery(mockBookingId);
      const result = await handler.execute(query);

      expect(contractRepository.findByBookingId).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
      expect(result).toBeUndefined();
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { ContractService } from "../../../../src/context/contract/service/contract.service";
import { ContractRepository } from "../../../../src/context/contract/infrastructure/contract.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { Contract } from "../../../../src/context/contract/domain/contract";
import { ContractStatus } from "../../../../src/context/contract/domain/contractStatus";
import { Role } from "../../../../src/context/shared/domain/role";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import ContractId from "../../../../src/context/shared/domain/contractId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import { ContractNotFoundException } from "../../../../src/context/contract/exceptions/contractNotFoundException";
import { UnableToCreateContractException } from "../../../../src/context/contract/exceptions/unableToCreateContractException";
import { NotOwnerOfTheRequestedBookingException } from "../../../../src/context/contract/exceptions/notOwnerOfTheRequestedBookingException";
import { BookingNotFoundException } from "../../../../src/context/contract/exceptions/bookingNotFoundException";
import { NotOwnerOfTheRequestedContractException } from "../../../../src/context/contract/exceptions/notOwnerOfTheRequestedContractException";
import { NotAMemberOfTheRequestedBandException } from "../../../../src/context/contract/exceptions/notAMemberOfTheRequestedBandException";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import UserId from "../../../../src/context/shared/domain/userId";

describe("ContractService", () => {
  let service: ContractService;
  let repository: jest.Mocked<ContractRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const mockContractId = ContractId.generate().toPrimitive();
  const mockBookingId = BookingId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();
  const mockFileUrl = "https://example.com/contract.pdf";
  const mockVidsignerDocGui = "test-doc-gui";

  const mockUserAuthInfo: UserAuthInfo = {
    id: mockUserId,
    role: Role.Musician,
    email: "test@example.com",
  };

  const mockClientAuthInfo: UserAuthInfo = {
    id: mockUserId,
    role: Role.Client,
    email: "test@example.com",
  };

  const mockContract = {
    getId: jest.fn().mockReturnValue(new ContractId(mockContractId)),
    getBookingId: jest.fn().mockReturnValue(new BookingId(mockBookingId)),
    toPrimitives: jest.fn().mockReturnValue({
      id: mockContractId,
      bookingId: mockBookingId,
      status: ContractStatus.PENDING,
      fileUrl: mockFileUrl,
      vidsignerDocGui: mockVidsignerDocGui,
    }),
    toPrimitivesWithoutDocGui: jest.fn().mockReturnValue({
      id: mockContractId,
      bookingId: mockBookingId,
      status: ContractStatus.PENDING,
      fileUrl: mockFileUrl,
    }),
  } as unknown as Contract;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
      findManyByUserId: jest.fn(),
      findManyByBandId: jest.fn(),
      findBookingBandIdByContractId: jest.fn(),
    } as any;

    moduleConnectors = {
      getBookingById: jest.fn(),
      obtainBandMembers: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: ContractRepository,
          useValue: repository,
        },
        {
          provide: ModuleConnectors,
          useValue: moduleConnectors,
        },
      ],
    }).compile();

    service = module.get<ContractService>(ContractService);
  });

  describe("create", () => {
    it("should successfully create a contract", async () => {
      const mockBooking = {
        id: mockBookingId,
        bandId: mockBandId,
        userId: mockUserId,
        status: BookingStatus.PENDING,
        initDate: new Date(),
        endDate: new Date(),
        name: "Test Event",
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "test-event-type",
        isPublic: true,
        cost: 1000,
      };
      const mockBandMembers = [mockUserId];

      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue(mockBandMembers);
      repository.create.mockResolvedValue(mockContract);

      const result = await service.create(mockUserAuthInfo, {
        bookingId: mockBookingId,
        fileUrl: mockFileUrl,
        vidsignerDocGui: mockVidsignerDocGui,
      });

      expect(result).toEqual(mockContract.toPrimitivesWithoutDocGui());
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(moduleConnectors.obtainBandMembers).toHaveBeenCalledWith(
        mockBandId,
      );
      expect(repository.create).toHaveBeenCalled();
    });

    it("should throw BookingNotFoundException when booking is not found", async () => {
      moduleConnectors.getBookingById.mockResolvedValue(undefined);

      await expect(
        service.create(mockUserAuthInfo, {
          bookingId: mockBookingId,
          fileUrl: mockFileUrl,
          vidsignerDocGui: mockVidsignerDocGui,
        }),
      ).rejects.toThrow(BookingNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBookingException when user is not a band member", async () => {
      const mockBooking = {
        id: mockBookingId,
        bandId: mockBandId,
        userId: "other-user-id",
        status: BookingStatus.PENDING,
        initDate: new Date(),
        endDate: new Date(),
        name: "Test Event",
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "test-event-type",
        isPublic: true,
        cost: 1000,
      };
      const mockBandMembers = ["other-user-id"];

      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue(mockBandMembers);

      await expect(
        service.create(mockUserAuthInfo, {
          bookingId: mockBookingId,
          fileUrl: mockFileUrl,
          vidsignerDocGui: mockVidsignerDocGui,
        }),
      ).rejects.toThrow(NotOwnerOfTheRequestedBookingException);
    });

    it("should throw UnableToCreateContractException when repository fails to create", async () => {
      const mockBooking = {
        id: mockBookingId,
        bandId: mockBandId,
        userId: mockUserId,
        status: BookingStatus.PENDING,
        initDate: new Date(),
        endDate: new Date(),
        name: "Test Event",
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "test-event-type",
        isPublic: true,
        cost: 1000,
      };
      const mockBandMembers = [mockUserId];

      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.obtainBandMembers.mockResolvedValue(mockBandMembers);
      repository.create.mockResolvedValue(null);

      await expect(
        service.create(mockUserAuthInfo, {
          bookingId: mockBookingId,
          fileUrl: mockFileUrl,
          vidsignerDocGui: mockVidsignerDocGui,
        }),
      ).rejects.toThrow(UnableToCreateContractException);
    });
  });

  describe("update", () => {
    it("should successfully update a contract", async () => {
      const updatedStatus = ContractStatus.SIGNED;
      const updatedFileUrl = "https://example.com/updated-contract.pdf";

      repository.findById.mockResolvedValue(mockContract);
      repository.findBookingBandIdByContractId.mockResolvedValue(mockBandId);
      moduleConnectors.obtainBandMembers.mockResolvedValue([mockUserId]);
      repository.update.mockResolvedValue(mockContract);

      const result = await service.update(mockUserAuthInfo, {
        id: mockContractId,
        status: updatedStatus,
        fileUrl: updatedFileUrl,
      });

      expect(result).toEqual(mockContract.toPrimitivesWithoutDocGui());
      expect(repository.findById).toHaveBeenCalledWith(
        new ContractId(mockContractId),
      );
      expect(repository.update).toHaveBeenCalled();
    });

    it("should throw ContractNotFoundException when contract is not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(mockUserAuthInfo, {
          id: mockContractId,
          status: ContractStatus.SIGNED,
          fileUrl: mockFileUrl,
        }),
      ).rejects.toThrow(ContractNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedContractException when user is not a band member", async () => {
      repository.findById.mockResolvedValue(mockContract);
      repository.findBookingBandIdByContractId.mockResolvedValue(mockBandId);
      moduleConnectors.obtainBandMembers.mockResolvedValue(["other-user-id"]);

      await expect(
        service.update(mockUserAuthInfo, {
          id: mockContractId,
          status: ContractStatus.SIGNED,
          fileUrl: mockFileUrl,
        }),
      ).rejects.toThrow(NotOwnerOfTheRequestedContractException);
    });
  });

  describe("delete", () => {
    it("should successfully delete a contract", async () => {
      repository.findById.mockResolvedValue(mockContract);
      repository.findBookingBandIdByContractId.mockResolvedValue(mockBandId);
      moduleConnectors.obtainBandMembers.mockResolvedValue([mockUserId]);
      repository.delete.mockResolvedValue(undefined);

      await service.delete(mockUserAuthInfo, mockContractId);

      expect(repository.findById).toHaveBeenCalledWith(
        new ContractId(mockContractId),
      );
      expect(repository.delete).toHaveBeenCalledWith(
        new ContractId(mockContractId),
      );
    });

    it("should throw ContractNotFoundException when contract is not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.delete(mockUserAuthInfo, mockContractId),
      ).rejects.toThrow(ContractNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedContractException when user is not a band member", async () => {
      repository.findById.mockResolvedValue(mockContract);
      repository.findBookingBandIdByContractId.mockResolvedValue(mockBandId);
      moduleConnectors.obtainBandMembers.mockResolvedValue(["other-user-id"]);

      await expect(
        service.delete(mockUserAuthInfo, mockContractId),
      ).rejects.toThrow(NotOwnerOfTheRequestedContractException);
    });
  });

  describe("findById", () => {
    it("should successfully find a contract for a musician", async () => {
      repository.findById.mockResolvedValue(mockContract);
      repository.findBookingBandIdByContractId.mockResolvedValue(mockBandId);
      moduleConnectors.obtainBandMembers.mockResolvedValue([mockUserId]);

      const result = await service.findById(mockUserAuthInfo, mockContractId);

      expect(result).toEqual(mockContract.toPrimitivesWithoutDocGui());
      expect(repository.findById).toHaveBeenCalledWith(
        new ContractId(mockContractId),
      );
    });

    it("should successfully find a contract for a client", async () => {
      const mockBooking = {
        id: mockBookingId,
        bandId: mockBandId,
        userId: mockUserId,
        status: BookingStatus.PENDING,
        initDate: new Date(),
        endDate: new Date(),
        name: "Test Event",
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "test-event-type",
        isPublic: true,
        cost: 1000,
      };

      repository.findById.mockResolvedValue(mockContract);
      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);

      const result = await service.findById(mockClientAuthInfo, mockContractId);

      expect(result).toEqual(mockContract.toPrimitivesWithoutDocGui());
      expect(repository.findById).toHaveBeenCalledWith(
        new ContractId(mockContractId),
      );
    });

    it("should throw ContractNotFoundException when contract is not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.findById(mockUserAuthInfo, mockContractId),
      ).rejects.toThrow(ContractNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedContractException when client is not the booking owner", async () => {
      const mockBooking = {
        id: mockBookingId,
        bandId: mockBandId,
        userId: "other-user-id",
        status: BookingStatus.PENDING,
        initDate: new Date(),
        endDate: new Date(),
        name: "Test Event",
        country: "Test Country",
        city: "Test City",
        venue: "Test Venue",
        postalCode: "12345",
        addressLine1: "Test Address 1",
        addressLine2: "Test Address 2",
        eventTypeId: "test-event-type",
        isPublic: true,
        cost: 1000,
      };

      repository.findById.mockResolvedValue(mockContract);
      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);

      await expect(
        service.findById(mockClientAuthInfo, mockContractId),
      ).rejects.toThrow(NotOwnerOfTheRequestedContractException);
    });
  });

  describe("findManyByUserId", () => {
    it("should successfully find contracts by user ID", async () => {
      const mockContracts = [mockContract];
      repository.findManyByUserId.mockResolvedValue(mockContracts);

      const result = await service.findManyByUserId(mockClientAuthInfo);

      expect(result).toEqual([mockContract.toPrimitivesWithoutDocGui()]);
      expect(repository.findManyByUserId).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe("findManyByBand", () => {
    it("should successfully find contracts by band ID", async () => {
      const mockContracts = [mockContract];
      moduleConnectors.obtainBandMembers.mockResolvedValue([mockUserId]);
      repository.findManyByBandId.mockResolvedValue(mockContracts);

      const result = await service.findManyByBand(mockUserAuthInfo, mockBandId);

      expect(result).toEqual([mockContract.toPrimitivesWithoutDocGui()]);
      expect(moduleConnectors.obtainBandMembers).toHaveBeenCalledWith(
        mockBandId,
      );
      expect(repository.findManyByBandId).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
    });

    it("should throw NotAMemberOfTheRequestedBandException when user is not a band member", async () => {
      moduleConnectors.obtainBandMembers.mockResolvedValue(["other-user-id"]);

      await expect(
        service.findManyByBand(mockUserAuthInfo, mockBandId),
      ).rejects.toThrow(NotAMemberOfTheRequestedBandException);
    });
  });
});

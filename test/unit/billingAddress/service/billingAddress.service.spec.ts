import { Test, TestingModule } from "@nestjs/testing";
import { BillingAddressService } from "../../../../src/context/billingAddress/service/billingAddress.service";
import { BillingAddressRepository } from "../../../../src/context/billingAddress/infrastructure/billingAddress.repository";
import { BillingAddress } from "../../../../src/context/billingAddress/domain/billingAddress";
import { Role } from "../../../../src/context/shared/domain/role";
import { BillingAddressNotFoundException } from "../../../../src/context/billingAddress/exceptions/billingAddressNotFoundException";
import { UnableToCreateBillingAddressException } from "../../../../src/context/billingAddress/exceptions/unableToCreateBillingAddressException";
import { NotOwnerOfTheRequestedBillingAddressException } from "../../../../src/context/billingAddress/exceptions/notOwnerOfTheRequestedBillingAddressException";
import UserId from "../../../../src/context/shared/domain/userId";
import BillingAddressId from "../../../../src/context/billingAddress/domain/billingAddressId";

describe("BillingAddressService", () => {
  let service: BillingAddressService;
  let repository: jest.Mocked<BillingAddressRepository>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockBillingAddressId = BillingAddressId.generate().toPrimitive();

  const mockUserAuthInfo = {
    id: mockUserId,
    role: Role.Client,
    email: "test@example.com",
  };

  const mockCreateBillingAddressRequest = {
    country: "Spain",
    city: "Barcelona",
    postalCode: "08001",
    addressLine1: "Carrer Example 123",
    addressLine2: "Floor 4",
  };

  const mockUpdateBillingAddressRequest = {
    id: mockBillingAddressId,
    country: "Spain",
    city: "Madrid",
    postalCode: "28001",
    addressLine1: "Calle Example 456",
    addressLine2: "Floor 2",
  };

  const mockBillingAddress: BillingAddress = {
    toPrimitives: jest.fn().mockReturnValue({
      id: mockBillingAddressId,
      userId: mockUserId,
      country: mockCreateBillingAddressRequest.country,
      city: mockCreateBillingAddressRequest.city,
      postalCode: mockCreateBillingAddressRequest.postalCode,
      addressLine1: mockCreateBillingAddressRequest.addressLine1,
      addressLine2: mockCreateBillingAddressRequest.addressLine2,
    }),
  } as unknown as BillingAddress;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingAddressService,
        {
          provide: BillingAddressRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByUserId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingAddressService>(BillingAddressService);
    repository = module.get(BillingAddressRepository);

    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should create a billing address successfully", async () => {
      repository.create.mockResolvedValue(mockBillingAddress);

      const result = await service.create(
        mockUserAuthInfo,
        mockCreateBillingAddressRequest,
      );

      expect(repository.create).toHaveBeenCalled();
      expect(result).toEqual(mockBillingAddress.toPrimitives());
    });

    it("should throw UnableToCreateBillingAddressException when creation fails", async () => {
      repository.create.mockResolvedValue(null);

      await expect(
        service.create(mockUserAuthInfo, mockCreateBillingAddressRequest),
      ).rejects.toThrow(UnableToCreateBillingAddressException);
    });
  });

  describe("findById", () => {
    it("should return billing address when found and user is owner", async () => {
      repository.findById.mockResolvedValue(mockBillingAddress);

      const result = await service.findById(
        mockUserAuthInfo,
        mockBillingAddressId,
      );

      expect(repository.findById).toHaveBeenCalledWith(
        expect.any(BillingAddressId),
      );
      expect(result).toEqual(mockBillingAddress.toPrimitives());
    });

    it("should throw BillingAddressNotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.findById(mockUserAuthInfo, mockBillingAddressId),
      ).rejects.toThrow(BillingAddressNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBillingAddressException when user is not owner", async () => {
      const differentUserId = UserId.generate().toPrimitive();
      (mockBillingAddress.toPrimitives as jest.Mock).mockReturnValueOnce({
        ...mockBillingAddress.toPrimitives(),
        userId: differentUserId,
      });
      repository.findById.mockResolvedValue(mockBillingAddress);

      await expect(
        service.findById(mockUserAuthInfo, mockBillingAddressId),
      ).rejects.toThrow(NotOwnerOfTheRequestedBillingAddressException);
    });
  });

  describe("findByUserId", () => {
    it("should return billing address when found", async () => {
      repository.findByUserId.mockResolvedValue(mockBillingAddress);

      const result = await service.findByUserId(mockUserAuthInfo, mockUserId);

      expect(repository.findByUserId).toHaveBeenCalledWith(expect.any(UserId));
      expect(result).toEqual(mockBillingAddress.toPrimitives());
    });

    it("should throw BillingAddressNotFoundException when not found", async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(
        service.findByUserId(mockUserAuthInfo, mockUserId),
      ).rejects.toThrow(BillingAddressNotFoundException);
    });
  });

  describe("update", () => {
    it("should update billing address successfully when user is owner", async () => {
      repository.findById.mockResolvedValue(mockBillingAddress);
      repository.update.mockResolvedValue(mockBillingAddress);

      const result = await service.update(
        mockUserAuthInfo,
        mockUpdateBillingAddressRequest,
      );

      expect(repository.findById).toHaveBeenCalledWith(
        expect.any(BillingAddressId),
      );
      expect(repository.update).toHaveBeenCalled();
      expect(result).toEqual(mockBillingAddress.toPrimitives());
    });

    it("should throw BillingAddressNotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update(mockUserAuthInfo, mockUpdateBillingAddressRequest),
      ).rejects.toThrow(BillingAddressNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBillingAddressException when user is not owner", async () => {
      const differentUserId = UserId.generate().toPrimitive();
      (mockBillingAddress.toPrimitives as jest.Mock).mockReturnValueOnce({
        ...mockBillingAddress.toPrimitives(),
        userId: differentUserId,
      });
      repository.findById.mockResolvedValue(mockBillingAddress);

      await expect(
        service.update(mockUserAuthInfo, mockUpdateBillingAddressRequest),
      ).rejects.toThrow(NotOwnerOfTheRequestedBillingAddressException);
    });

    it("should throw UnableToCreateBillingAddressException when update fails", async () => {
      repository.findById.mockResolvedValue(mockBillingAddress);
      repository.update.mockResolvedValue(null);

      await expect(
        service.update(mockUserAuthInfo, mockUpdateBillingAddressRequest),
      ).rejects.toThrow(UnableToCreateBillingAddressException);
    });
  });

  describe("delete", () => {
    it("should delete billing address successfully when user is owner", async () => {
      repository.findById.mockResolvedValue(mockBillingAddress);
      repository.delete.mockResolvedValue();

      await service.delete(mockUserAuthInfo, mockBillingAddressId);

      expect(repository.findById).toHaveBeenCalledWith(
        expect.any(BillingAddressId),
      );
      expect(repository.delete).toHaveBeenCalledWith(
        expect.any(BillingAddressId),
      );
    });

    it("should throw BillingAddressNotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.delete(mockUserAuthInfo, mockBillingAddressId),
      ).rejects.toThrow(BillingAddressNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedBillingAddressException when user is not owner", async () => {
      const differentUserId = UserId.generate().toPrimitive();
      (mockBillingAddress.toPrimitives as jest.Mock).mockReturnValueOnce({
        ...mockBillingAddress.toPrimitives(),
        userId: differentUserId,
      });
      repository.findById.mockResolvedValue(mockBillingAddress);

      await expect(
        service.delete(mockUserAuthInfo, mockBillingAddressId),
      ).rejects.toThrow(NotOwnerOfTheRequestedBillingAddressException);
    });
  });
});

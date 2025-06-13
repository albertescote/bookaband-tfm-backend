import { Test, TestingModule } from "@nestjs/testing";
import { BillingAddressController } from "../../../../src/app/api/billingAddress/billingAddress.controller";
import { BillingAddressService } from "../../../../src/context/billingAddress/service/billingAddress.service";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { CreateBillingAddressRequestDto } from "../../../../src/app/api/billingAddress/createBillingAddressRequest.dto";
import { UpdateBillingAddressRequestDto } from "../../../../src/app/api/billingAddress/updateBillingAddressRequest.dto";

describe("BillingAddressController", () => {
  let controller: BillingAddressController;

  const mockBillingAddressService = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUser: UserAuthInfo = {
    id: "1",
    email: "test@example.com",
    role: Role.Client,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingAddressController],
      providers: [
        {
          provide: BillingAddressService,
          useValue: mockBillingAddressService,
        },
      ],
    }).compile();

    controller = module.get<BillingAddressController>(BillingAddressController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new billing address", async () => {
      const createDto: CreateBillingAddressRequestDto = {
        country: "Spain",
        city: "Barcelona",
        postalCode: "08001",
        addressLine1: "Main Street 123",
        addressLine2: "Floor 4",
      };

      const expectedResponse = {
        id: "address-123",
        userId: mockUser.id,
        ...createDto,
      };

      mockBillingAddressService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create({ user: mockUser }, createDto);

      expect(result).toEqual(expectedResponse);
      expect(mockBillingAddressService.create).toHaveBeenCalledWith(
        mockUser,
        createDto,
      );
    });
  });

  describe("findByUserId", () => {
    it("should return billing address for a user", async () => {
      const userId = "1";
      const expectedResponse = {
        id: "address-123",
        userId: userId,
        country: "Spain",
        city: "Barcelona",
        postalCode: "08001",
        addressLine1: "Main Street 123",
        addressLine2: "Floor 4",
      };

      mockBillingAddressService.findByUserId.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.findByUserId({ user: mockUser }, userId);

      expect(result).toEqual(expectedResponse);
      expect(mockBillingAddressService.findByUserId).toHaveBeenCalledWith(
        mockUser,
        userId,
      );
    });
  });

  describe("findById", () => {
    it("should return a billing address by id", async () => {
      const addressId = "address-123";
      const expectedResponse = {
        id: addressId,
        userId: mockUser.id,
        country: "Spain",
        city: "Barcelona",
        postalCode: "08001",
        addressLine1: "Main Street 123",
        addressLine2: "Floor 4",
      };

      mockBillingAddressService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById({ user: mockUser }, addressId);

      expect(result).toEqual(expectedResponse);
      expect(mockBillingAddressService.findById).toHaveBeenCalledWith(
        mockUser,
        addressId,
      );
    });
  });

  describe("update", () => {
    it("should update a billing address", async () => {
      const addressId = "address-123";
      const updateDto: UpdateBillingAddressRequestDto = {
        country: "Spain",
        city: "Madrid",
        postalCode: "28001",
        addressLine1: "New Street 456",
        addressLine2: "Floor 2",
      };

      const expectedResponse = {
        id: addressId,
        userId: mockUser.id,
        ...updateDto,
      };

      mockBillingAddressService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        { user: mockUser },
        updateDto,
        addressId,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockBillingAddressService.update).toHaveBeenCalledWith(mockUser, {
        ...updateDto,
        id: addressId,
      });
    });
  });

  describe("delete", () => {
    it("should delete a billing address", async () => {
      const addressId = "address-123";

      await controller.delete({ user: mockUser }, addressId);

      expect(mockBillingAddressService.delete).toHaveBeenCalledWith(
        mockUser,
        addressId,
      );
    });
  });
});

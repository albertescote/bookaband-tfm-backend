import { Test, TestingModule } from "@nestjs/testing";
import { PaymentMethodController } from "../../../../src/app/api/paymentMethod/paymentMethod.controller";
import { PaymentMethodService } from "../../../../src/context/paymentMethod/service/paymentMethod.service";
import { CreatePaymentMethodRequestDto } from "../../../../src/app/api/paymentMethod/createPaymentMethodRequest.dto";
import { UpdatePaymentMethodRequestDto } from "../../../../src/app/api/paymentMethod/updatePaymentMethodRequest.dto";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";

interface PaymentMethodResponseDto {
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
  createdAt: Date;
  brand?: string;
  alias?: string;
}

describe("PaymentMethodController", () => {
  let controller: PaymentMethodController;

  const mockPaymentMethodService = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentMethodController],
      providers: [
        {
          provide: PaymentMethodService,
          useValue: mockPaymentMethodService,
        },
      ],
    }).compile();

    controller = module.get<PaymentMethodController>(PaymentMethodController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new payment method", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const createPaymentMethodDto: CreatePaymentMethodRequestDto = {
        provider: "stripe",
        providerId: "pm_123",
        type: "card",
        lastFour: "4242",
        isDefault: true,
        brand: "visa",
        alias: "My Card",
      };

      const expectedResponse: PaymentMethodResponseDto = {
        id: "1",
        userId: "1",
        provider: "stripe",
        providerId: "pm_123",
        type: "card",
        lastFour: "4242",
        isDefault: true,
        brand: "visa",
        alias: "My Card",
        createdAt: new Date(),
      };

      mockPaymentMethodService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(
        { user: mockUser },
        createPaymentMethodDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentMethodService.create).toHaveBeenCalledWith(
        mockUser,
        createPaymentMethodDto,
      );
    });
  });

  describe("findByUserId", () => {
    it("should return payment methods for a user", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const userId = "1";

      const expectedResponse: PaymentMethodResponseDto[] = [
        {
          id: "1",
          userId: "1",
          provider: "stripe",
          providerId: "pm_123",
          type: "card",
          lastFour: "4242",
          isDefault: true,
          brand: "visa",
          alias: "My Card",
          createdAt: new Date(),
        },
      ];

      mockPaymentMethodService.findByUserId.mockResolvedValue(expectedResponse);

      const result = await controller.findByUserId({ user: mockUser }, userId);

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentMethodService.findByUserId).toHaveBeenCalledWith(
        mockUser,
        userId,
      );
    });
  });

  describe("findById", () => {
    it("should return a payment method by id", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const paymentMethodId = "1";

      const expectedResponse: PaymentMethodResponseDto = {
        id: "1",
        userId: "1",
        provider: "stripe",
        providerId: "pm_123",
        type: "card",
        lastFour: "4242",
        isDefault: true,
        brand: "visa",
        alias: "My Card",
        createdAt: new Date(),
      };

      mockPaymentMethodService.findById.mockResolvedValue(expectedResponse);

      const result = await controller.findById(
        { user: mockUser },
        paymentMethodId,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentMethodService.findById).toHaveBeenCalledWith(
        mockUser,
        paymentMethodId,
      );
    });
  });

  describe("update", () => {
    it("should update a payment method", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const paymentMethodId = "1";

      const updatePaymentMethodDto: UpdatePaymentMethodRequestDto = {
        isDefault: false,
        alias: "Updated Card",
      };

      const expectedResponse: PaymentMethodResponseDto = {
        id: "1",
        userId: "1",
        provider: "stripe",
        providerId: "pm_123",
        type: "card",
        lastFour: "4242",
        isDefault: false,
        brand: "visa",
        alias: "Updated Card",
        createdAt: new Date(),
      };

      mockPaymentMethodService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        { user: mockUser },
        updatePaymentMethodDto,
        paymentMethodId,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockPaymentMethodService.update).toHaveBeenCalledWith(mockUser, {
        ...updatePaymentMethodDto,
        id: paymentMethodId,
      });
    });
  });

  describe("delete", () => {
    it("should delete a payment method", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const paymentMethodId = "1";

      mockPaymentMethodService.delete.mockResolvedValue(undefined);

      await controller.delete({ user: mockUser }, paymentMethodId);

      expect(mockPaymentMethodService.delete).toHaveBeenCalledWith(
        mockUser,
        paymentMethodId,
      );
    });
  });
});

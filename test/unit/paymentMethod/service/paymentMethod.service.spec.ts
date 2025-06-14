import { Test, TestingModule } from "@nestjs/testing";
import { PaymentMethodService } from "../../../../src/context/paymentMethod/service/paymentMethod.service";
import { PaymentMethodRepository } from "../../../../src/context/paymentMethod/infrastructure/paymentMethod.repository";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { PaymentMethod } from "../../../../src/context/paymentMethod/domain/paymentMethod";
import { PaymentMethodNotFoundException } from "../../../../src/context/paymentMethod/exceptions/paymentMethodNotFoundException";
import { NotOwnerOfTheRequestedPaymentMethodException } from "../../../../src/context/paymentMethod/exceptions/notOwnerOfTheRequestedPaymentMethodException";
import { UnableToCreatePaymentMethodException } from "../../../../src/context/paymentMethod/exceptions/unableToCreatePaymentMethodException";
import { UnableToCreateBillingAddressException } from "../../../../src/context/billingAddress/exceptions/unableToCreateBillingAddressException";
import PaymentMethodId from "../../../../src/context/paymentMethod/domain/paymentMethodId";
import UserId from "../../../../src/context/shared/domain/userId";

describe("PaymentMethodService", () => {
  let service: PaymentMethodService;
  let repository: jest.Mocked<PaymentMethodRepository>;

  const userId = UserId.generate().toPrimitive();
  const paymentMethodId = PaymentMethodId.generate().toPrimitive();
  const mockUser: UserAuthInfo = {
    id: userId,
    email: "test@example.com",
    role: Role.Client,
  };

  const mockPaymentMethod = {
    getId: () => ({ toPrimitive: () => paymentMethodId }),
    toPrimitives: () => ({
      id: paymentMethodId,
      userId: userId,
      provider: "stripe",
      providerId: "pm_123",
      type: "card",
      lastFour: "4242",
      isDefault: true,
      brand: "visa",
      alias: "My Card",
      createdAt: new Date(),
    }),
  } as unknown as PaymentMethod;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentMethodService,
        {
          provide: PaymentMethodRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PaymentMethodService>(PaymentMethodService);
    repository = module.get(PaymentMethodRepository);
  });

  describe("create", () => {
    const createRequest = {
      provider: "stripe",
      providerId: "pm_123",
      type: "card",
      lastFour: "4242",
      isDefault: true,
      brand: "visa",
      alias: "My Card",
    };

    it("should create a payment method successfully", async () => {
      repository.create.mockResolvedValue(mockPaymentMethod);

      const result = await service.create(mockUser, createRequest);

      expect(result).toEqual({
        ...mockPaymentMethod.toPrimitives(),
        createdAt: expect.any(Date),
      });
      expect(repository.create).toHaveBeenCalledWith(expect.any(PaymentMethod));
    });

    it("should throw UnableToCreatePaymentMethodException when creation fails", async () => {
      repository.create.mockResolvedValue(null);

      await expect(service.create(mockUser, createRequest)).rejects.toThrow(
        UnableToCreatePaymentMethodException,
      );
    });
  });

  describe("findById", () => {
    it("should return payment method when found and owned by user", async () => {
      repository.findById.mockResolvedValue(mockPaymentMethod);

      const result = await service.findById(mockUser, paymentMethodId);

      expect(result).toEqual({
        ...mockPaymentMethod.toPrimitives(),
        createdAt: expect.any(Date),
      });
      expect(repository.findById).toHaveBeenCalledWith(
        new PaymentMethodId(paymentMethodId),
      );
    });

    it("should throw PaymentMethodNotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(mockUser, paymentMethodId)).rejects.toThrow(
        PaymentMethodNotFoundException,
      );
    });

    it("should throw NotOwnerOfTheRequestedPaymentMethodException when not owned by user", async () => {
      const otherUserId = UserId.generate().toPrimitive();
      const otherUserPaymentMethod = {
        ...mockPaymentMethod,
        toPrimitives: () => ({
          ...mockPaymentMethod.toPrimitives(),
          userId: otherUserId,
        }),
      } as unknown as PaymentMethod;
      repository.findById.mockResolvedValue(otherUserPaymentMethod);

      await expect(service.findById(mockUser, paymentMethodId)).rejects.toThrow(
        NotOwnerOfTheRequestedPaymentMethodException,
      );
    });
  });

  describe("findByUserId", () => {
    it("should return payment methods for user", async () => {
      const methods = [mockPaymentMethod];
      repository.findByUserId.mockResolvedValue(methods);

      const result = await service.findByUserId(mockUser, userId);

      expect(result).toEqual([
        {
          ...mockPaymentMethod.toPrimitives(),
          createdAt: expect.any(Date),
        },
      ]);
      expect(repository.findByUserId).toHaveBeenCalledWith(new UserId(userId));
    });

    it("should throw PaymentMethodNotFoundException when no methods found", async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.findByUserId(mockUser, userId)).rejects.toThrow(
        PaymentMethodNotFoundException,
      );
    });
  });

  describe("update", () => {
    const updateRequest = {
      id: paymentMethodId,
      isDefault: false,
      alias: "Updated Card",
    };

    it("should update payment method successfully", async () => {
      repository.findById.mockResolvedValue(mockPaymentMethod);
      repository.update.mockResolvedValue({
        ...mockPaymentMethod,
        toPrimitives: () => ({
          ...mockPaymentMethod.toPrimitives(),
          isDefault: false,
          alias: "Updated Card",
        }),
      } as unknown as PaymentMethod);

      const result = await service.update(mockUser, updateRequest);

      expect(result).toEqual({
        ...mockPaymentMethod.toPrimitives(),
        isDefault: false,
        alias: "Updated Card",
      });
      expect(repository.update).toHaveBeenCalled();
    });

    it("should throw PaymentMethodNotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update(mockUser, updateRequest)).rejects.toThrow(
        PaymentMethodNotFoundException,
      );
    });

    it("should throw NotOwnerOfTheRequestedPaymentMethodException when not owned by user", async () => {
      const otherUserId = UserId.generate().toPrimitive();
      const otherUserPaymentMethod = {
        ...mockPaymentMethod,
        toPrimitives: () => ({
          ...mockPaymentMethod.toPrimitives(),
          userId: otherUserId,
        }),
      } as unknown as PaymentMethod;
      repository.findById.mockResolvedValue(otherUserPaymentMethod);

      await expect(service.update(mockUser, updateRequest)).rejects.toThrow(
        NotOwnerOfTheRequestedPaymentMethodException,
      );
    });

    it("should throw UnableToCreateBillingAddressException when update fails", async () => {
      repository.findById.mockResolvedValue(mockPaymentMethod);
      repository.update.mockResolvedValue(null);

      await expect(service.update(mockUser, updateRequest)).rejects.toThrow(
        UnableToCreateBillingAddressException,
      );
    });
  });

  describe("delete", () => {
    it("should delete payment method successfully", async () => {
      repository.findById.mockResolvedValue(mockPaymentMethod);
      repository.delete.mockResolvedValue(undefined);

      await service.delete(mockUser, paymentMethodId);

      expect(repository.delete).toHaveBeenCalledWith(
        new PaymentMethodId(paymentMethodId),
      );
    });

    it("should throw PaymentMethodNotFoundException when not found", async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete(mockUser, paymentMethodId)).rejects.toThrow(
        PaymentMethodNotFoundException,
      );
    });

    it("should throw NotOwnerOfTheRequestedPaymentMethodException when not owned by user", async () => {
      const otherUserId = UserId.generate().toPrimitive();
      const otherUserPaymentMethod = {
        ...mockPaymentMethod,
        toPrimitives: () => ({
          ...mockPaymentMethod.toPrimitives(),
          userId: otherUserId,
        }),
      } as unknown as PaymentMethod;
      repository.findById.mockResolvedValue(otherUserPaymentMethod);

      await expect(service.delete(mockUser, paymentMethodId)).rejects.toThrow(
        NotOwnerOfTheRequestedPaymentMethodException,
      );
    });
  });
});

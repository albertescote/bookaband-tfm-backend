import UserId from "../../shared/domain/userId";
import PaymentMethodId from "./paymentMethodId";

export interface PaymentMethodPrimitives {
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
  createdAt: Date;
  brand?: string;
}

export class PaymentMethod {
  constructor(
    private id: PaymentMethodId,
    private userId: UserId,
    private provider: string,
    private providerId: string,
    private type: string,
    private lastFour: string,
    private isDefault: boolean,
    private createdAt: Date,
    private brand?: string,
  ) {}

  static fromPrimitives(primitives: PaymentMethodPrimitives): PaymentMethod {
    return new PaymentMethod(
      new PaymentMethodId(primitives.id),
      new UserId(primitives.userId),
      primitives.provider,
      primitives.providerId,
      primitives.type,
      primitives.lastFour,
      primitives.isDefault,
      primitives.createdAt,
      primitives.brand,
    );
  }

  static create(
    userId: UserId,
    provider: string,
    providerId: string,
    type: string,
    lastFour: string,
    isDefault: boolean,
    brand?: string,
  ): PaymentMethod {
    return new PaymentMethod(
      PaymentMethodId.generate(),
      userId,
      provider,
      providerId,
      type,
      lastFour,
      isDefault,
      new Date(),
      brand,
    );
  }

  toPrimitives(): PaymentMethodPrimitives {
    return {
      id: this.id.toPrimitive(),
      userId: this.userId.toPrimitive(),
      provider: this.provider,
      providerId: this.providerId,
      type: this.type,
      lastFour: this.lastFour,
      isDefault: this.isDefault,
      createdAt: this.createdAt,
      brand: this.brand,
    };
  }
}

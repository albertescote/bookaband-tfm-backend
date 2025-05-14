import UserId from "../../shared/domain/userId";
import BillingAddressId from "./billingAddressId";

export interface BillingAddressPrimitives {
  id: string;
  userId: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
}
export class BillingAddress {
  constructor(
    private id: BillingAddressId,
    private userId: UserId,
    private country: string,
    private city: string,
    private postalCode: string,
    private addressLine1: string,
    private addressLine2?: string,
  ) {}

  static fromPrimitives(primitives: BillingAddressPrimitives): BillingAddress {
    return new BillingAddress(
      new BillingAddressId(primitives.id),
      new UserId(primitives.userId),
      primitives.country,
      primitives.city,
      primitives.postalCode,
      primitives.addressLine1,
      primitives.addressLine2,
    );
  }

  static create(
    userId: UserId,
    city: string,
    country: string,
    postalCode: string,
    addressLine1: string,
    addressLine2: string,
  ) {
    return new BillingAddress(
      BillingAddressId.generate(),
      userId,
      country,
      city,
      postalCode,
      addressLine1,
      addressLine2,
    );
  }

  toPrimitives(): BillingAddressPrimitives {
    return {
      id: this.id.toPrimitive(),
      userId: this.userId.toPrimitive(),
      country: this.country,
      city: this.city,
      postalCode: this.postalCode,
      addressLine1: this.addressLine1,
      addressLine2: this.addressLine2,
    };
  }
}

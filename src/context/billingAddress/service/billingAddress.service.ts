import { Injectable } from "@nestjs/common";
import { BillingAddressRepository } from "../infrastructure/billingAddress.repository";
import {
  BillingAddress,
  BillingAddressPrimitives,
} from "../domain/billingAddress";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { BillingAddressNotFoundException } from "../exceptions/billingAddressNotFoundException";
import { UnableToCreateBillingAddressException } from "../exceptions/unableToCreateBillingAddressException";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { NotOwnerOfTheRequestedBillingAddressException } from "../exceptions/notOwnerOfTheRequestedBillingAddressException";
import UserId from "../../shared/domain/userId";
import BillingAddressId from "../domain/billingAddressId";

export interface UpdateBillingAddressRequest {
  id: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
}

export interface CreateBillingAddressRequest {
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
}

@Injectable()
export class BillingAddressService {
  constructor(private readonly repository: BillingAddressRepository) {}

  @RoleAuth([Role.Client])
  async create(
    userAuthInfo: UserAuthInfo,
    request: CreateBillingAddressRequest,
  ): Promise<BillingAddressPrimitives> {
    const billingAddress = await this.repository.create(
      BillingAddress.create(
        new UserId(userAuthInfo.id),
        request.city,
        request.country,
        request.postalCode,
        request.addressLine1,
        request.addressLine2,
      ),
    );
    if (!billingAddress) {
      throw new UnableToCreateBillingAddressException();
    }
    return billingAddress.toPrimitives();
  }

  @RoleAuth([Role.Client])
  async findById(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<BillingAddressPrimitives> {
    const billingAddress = await this.repository.findById(
      new BillingAddressId(id),
    );
    if (!billingAddress) {
      throw new BillingAddressNotFoundException();
    }
    const primitives = billingAddress.toPrimitives();
    this.checkOwnership(primitives, userAuthInfo.id);
    return primitives;
  }

  @RoleAuth([Role.Client])
  async findByUserId(
    _: UserAuthInfo,
    userId: string,
  ): Promise<BillingAddressPrimitives> {
    const billingAddress = await this.repository.findByUserId(
      new UserId(userId),
    );
    if (!billingAddress) {
      throw new BillingAddressNotFoundException();
    }
    return billingAddress.toPrimitives();
  }

  @RoleAuth([Role.Client])
  async update(
    userAuthInfo: UserAuthInfo,
    updateBillingAddressRequest: UpdateBillingAddressRequest,
  ): Promise<BillingAddressPrimitives> {
    const storedBillingAddress = await this.repository.findById(
      new BillingAddressId(updateBillingAddressRequest.id),
    );
    if (!storedBillingAddress) {
      throw new BillingAddressNotFoundException();
    }
    this.checkOwnership(storedBillingAddress.toPrimitives(), userAuthInfo.id);
    const billingAddress = await this.repository.update(
      BillingAddress.fromPrimitives({
        ...updateBillingAddressRequest,
        userId: userAuthInfo.id,
      }),
    );
    if (!billingAddress) {
      throw new UnableToCreateBillingAddressException();
    }
    return billingAddress.toPrimitives();
  }

  @RoleAuth([Role.Client])
  async delete(userAuthInfo: UserAuthInfo, id: string): Promise<void> {
    const billingAddressId = new BillingAddressId(id);
    const billingAddress = await this.repository.findById(billingAddressId);
    if (!billingAddress) {
      throw new BillingAddressNotFoundException();
    }
    const primitives = billingAddress.toPrimitives();
    this.checkOwnership(primitives, userAuthInfo.id);

    await this.repository.delete(billingAddressId);
  }

  private checkOwnership(
    billingAddress: BillingAddressPrimitives,
    userId: string,
  ) {
    if (billingAddress.userId !== userId) {
      throw new NotOwnerOfTheRequestedBillingAddressException(
        billingAddress.id,
      );
    }
  }
}

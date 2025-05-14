import { Injectable } from "@nestjs/common";
import PaymentMethodId from "../domain/paymentMethodId";
import UserId from "../../shared/domain/userId";
import { Role } from "../../shared/domain/role";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { PaymentMethodNotFoundException } from "../exceptions/paymentMethodNotFoundException";
import { NotOwnerOfTheRequestedPaymentMethodException } from "../exceptions/notOwnerOfTheRequestedPaymentMethodException";
import { UnableToCreatePaymentMethodException } from "../exceptions/unableToCreatePaymentMethodException";
import { PaymentMethodRepository } from "../infrastructure/paymentMethod.repository";
import {
  PaymentMethod,
  PaymentMethodPrimitives,
} from "../domain/paymentMethod";
import { UnableToCreateBillingAddressException } from "../../billingAddress/exceptions/unableToCreateBillingAddressException";

export interface UpdatePaymentMethodRequest {
  id: string;
  provider: string;
  providerId: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
  brand?: string;
}

export interface CreatePaymentMethodRequest {
  provider: string;
  providerId: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
  brand?: string;
}

@Injectable()
export class PaymentMethodService {
  constructor(private readonly repository: PaymentMethodRepository) {}

  @RoleAuth([Role.Client])
  async create(
    user: UserAuthInfo,
    request: CreatePaymentMethodRequest,
  ): Promise<PaymentMethodPrimitives> {
    const method = PaymentMethod.create(
      new UserId(user.id),
      request.provider,
      request.providerId,
      request.type,
      request.lastFour,
      request.isDefault,
      request.brand,
    );
    const saved = await this.repository.create(method);
    if (!saved) throw new UnableToCreatePaymentMethodException();
    return saved.toPrimitives();
  }

  @RoleAuth([Role.Client])
  async findById(
    user: UserAuthInfo,
    id: string,
  ): Promise<PaymentMethodPrimitives> {
    const method = await this.repository.findById(new PaymentMethodId(id));
    if (!method) throw new PaymentMethodNotFoundException();
    const primitives = method.toPrimitives();
    this.checkOwnership(primitives, user.id);
    return primitives;
  }

  @RoleAuth([Role.Client])
  async findByUserId(
    _: UserAuthInfo,
    userId: string,
  ): Promise<PaymentMethodPrimitives[]> {
    const methods = await this.repository.findByUserId(new UserId(userId));
    if (!methods) throw new PaymentMethodNotFoundException();
    return methods.map((m) => m.toPrimitives());
  }

  @RoleAuth([Role.Client])
  async update(
    userAuthInfo: UserAuthInfo,
    updatePaymentMethodRequest: UpdatePaymentMethodRequest,
  ): Promise<PaymentMethodPrimitives> {
    const storedPaymentMethod = await this.repository.findById(
      new PaymentMethodId(updatePaymentMethodRequest.id),
    );
    if (!storedPaymentMethod) {
      throw new PaymentMethodNotFoundException();
    }
    const primitives = storedPaymentMethod.toPrimitives();
    this.checkOwnership(primitives, userAuthInfo.id);
    const paymentMethod = await this.repository.update(
      PaymentMethod.fromPrimitives({
        ...updatePaymentMethodRequest,
        userId: userAuthInfo.id,
        createdAt: primitives.createdAt,
      }),
    );
    if (!paymentMethod) {
      throw new UnableToCreateBillingAddressException();
    }
    return paymentMethod.toPrimitives();
  }

  @RoleAuth([Role.Client])
  async delete(user: UserAuthInfo, id: string): Promise<void> {
    const method = await this.repository.findById(new PaymentMethodId(id));
    if (!method) throw new PaymentMethodNotFoundException();
    this.checkOwnership(method.toPrimitives(), user.id);
    await this.repository.delete(new PaymentMethodId(id));
  }

  private checkOwnership(method: PaymentMethodPrimitives, userId: string) {
    if (method.userId !== userId) {
      throw new NotOwnerOfTheRequestedPaymentMethodException(method.id);
    }
  }
}

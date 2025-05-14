import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import UserId from "../../shared/domain/userId";
import PaymentMethodId from "../domain/paymentMethodId";
import { PaymentMethod } from "../domain/paymentMethod";

@Injectable()
export class PaymentMethodRepository {
  private readonly prisma = new PrismaClient();

  async findById(id: PaymentMethodId): Promise<PaymentMethod | undefined> {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id: id.toPrimitive() },
    });
    if (!method) return undefined;
    return PaymentMethod.fromPrimitives(method);
  }

  async findByUserId(userId: UserId): Promise<PaymentMethod[] | undefined> {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { userId: userId.toPrimitive() },
      orderBy: { createdAt: "desc" },
    });
    if (!methods.length) return undefined;
    return methods.map(PaymentMethod.fromPrimitives);
  }

  async create(method: PaymentMethod): Promise<PaymentMethod> {
    const created = await this.prisma.paymentMethod.create({
      data: method.toPrimitives(),
    });
    return PaymentMethod.fromPrimitives(created);
  }

  async update(method: PaymentMethod): Promise<PaymentMethod> {
    const primitives = method.toPrimitives();
    const updated = await this.prisma.paymentMethod.update({
      where: { id: primitives.id },
      data: primitives,
    });
    return PaymentMethod.fromPrimitives(updated);
  }

  async delete(id: PaymentMethodId): Promise<void> {
    await this.prisma.paymentMethod.delete({
      where: { id: id.toPrimitive() },
    });
  }
}

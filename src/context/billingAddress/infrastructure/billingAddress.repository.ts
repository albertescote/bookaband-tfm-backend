import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { BillingAddress } from "../domain/billingAddress";
import UserId from "../../shared/domain/userId";
import BillingAddressId from "../domain/billingAddressId";

@Injectable()
export class BillingAddressRepository {
  private readonly prisma = new PrismaClient();

  async findById(id: BillingAddressId): Promise<BillingAddress> {
    const billingAddress = await this.prisma.billingAddress.findUnique({
      where: { id: id.toPrimitive() },
    });
    if (!billingAddress) {
      return undefined;
    }
    return BillingAddress.fromPrimitives(billingAddress);
  }

  async findByUserId(userId: UserId): Promise<BillingAddress> {
    const billingAddress = await this.prisma.billingAddress.findUnique({
      where: { userId: userId.toPrimitive() },
    });
    if (!billingAddress) {
      return undefined;
    }
    return BillingAddress.fromPrimitives(billingAddress);
  }

  async create(address: BillingAddress): Promise<BillingAddress> {
    const billingAddress = await this.prisma.billingAddress.create({
      data: address.toPrimitives(),
    });
    if (!billingAddress) {
      return undefined;
    }
    return BillingAddress.fromPrimitives(billingAddress);
  }

  async update(address: BillingAddress): Promise<BillingAddress> {
    const primitives = address.toPrimitives();
    const updatedAddress = await this.prisma.billingAddress.update({
      where: { id: primitives.id },
      data: primitives,
    });
    if (!updatedAddress) {
      return undefined;
    }
    return BillingAddress.fromPrimitives(updatedAddress);
  }

  async delete(id: BillingAddressId): Promise<void> {
    await this.prisma.billingAddress.delete({
      where: { id: id.toPrimitive() },
    });
  }
}

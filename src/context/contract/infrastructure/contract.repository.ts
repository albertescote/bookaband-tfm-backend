import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { Contract } from "../domain/contract";
import ContractId from "../domain/contractId";

@Injectable()
export class ContractRepository {
  private readonly prisma = new PrismaClient();

  async findById(id: ContractId): Promise<Contract | undefined> {
    const contract = await this.prisma.contract.findUnique({
      where: { id: id.toPrimitive() },
    });

    return contract ? Contract.fromPrimitives(contract) : undefined;
  }

  async findBookingBandIdByContractId(contractId: string): Promise<string> {
    const result = await this.prisma.contract.findUnique({
      where: { id: contractId },
      select: {
        booking: {
          select: {
            bandId: true,
          },
        },
      },
    });
    if (!result) return undefined;

    return result.booking.bandId;
  }

  async findManyByUserId(userId: string): Promise<Contract[]> {
    const contracts = await this.prisma.contract.findMany({
      where: {
        booking: {
          userId: userId,
        },
      },
      include: {
        booking: true,
      },
    });

    return contracts.map((c) => Contract.fromPrimitives(c));
  }

  async create(contract: Contract): Promise<Contract> {
    const created = await this.prisma.contract.create({
      data: contract.toPrimitives(),
    });

    return Contract.fromPrimitives(created);
  }

  async update(contract: Contract): Promise<Contract> {
    const updated = await this.prisma.contract.update({
      where: { id: contract.toPrimitives().id },
      data: contract.toPrimitives(),
    });

    return Contract.fromPrimitives(updated);
  }

  async delete(id: ContractId): Promise<void> {
    await this.prisma.contract.delete({
      where: { id: id.toPrimitive() },
    });
  }
}

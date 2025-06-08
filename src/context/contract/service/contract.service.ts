import { Injectable } from "@nestjs/common";
import { ContractRepository } from "../infrastructure/contract.repository";
import { Contract, ContractPrimitives } from "../domain/contract";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import ContractId from "../domain/contractId";
import { ContractNotFoundException } from "../exceptions/contractNotFoundException";
import { ContractStatus } from "../domain/contractStatus";
import BookingId from "../../shared/domain/bookingId";
import { UnableToCreateContractException } from "../exceptions/unableToCreateContractException";
import { NotOwnerOfTheRequestedContractException } from "../exceptions/notOwnerOfTheRequestedContractException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { UserIdNotFoundForBookingIdException } from "../exceptions/userIdNotFoundForBookingIdException";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";

export interface CreateContractRequest {
  bookingId: string;
  status: ContractStatus;
  fileUrl: string;
}

export interface UpdateContractRequest {
  id: string;
  status: ContractStatus;
  fileUrl: string;
}

@Injectable()
export class ContractService {
  constructor(
    private readonly repository: ContractRepository,
    private readonly moduleConnectors: ModuleConnectors,
  ) {}

  @RoleAuth([Role.Musician])
  async create(
    user: UserAuthInfo,
    request: CreateContractRequest,
  ): Promise<ContractPrimitives> {
    await this.checkCreationOwnership(request, user);

    const contract = Contract.create(
      new BookingId(request.bookingId),
      request.status,
      request.fileUrl,
    );
    const created = await this.repository.create(contract);
    if (!created) throw new UnableToCreateContractException();

    return created.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async update(
    user: UserAuthInfo,
    request: UpdateContractRequest,
  ): Promise<ContractPrimitives> {
    const existing = await this.repository.findById(new ContractId(request.id));
    if (!existing) throw new ContractNotFoundException();

    await this.checkRequestedContractOwnership(request.id, user);

    const updated = await this.repository.update(
      Contract.fromPrimitives({
        ...existing.toPrimitives(),
        status: request.status,
        fileUrl: request.fileUrl,
      }),
    );

    return updated.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async delete(user: UserAuthInfo, id: string): Promise<void> {
    const existing = await this.repository.findById(new ContractId(id));
    if (!existing) throw new ContractNotFoundException();

    await this.checkRequestedContractOwnership(id, user);

    await this.repository.delete(new ContractId(id));
  }

  @RoleAuth([Role.Musician, Role.Client])
  async findById(user: UserAuthInfo, id: string): Promise<ContractPrimitives> {
    const contract = await this.repository.findById(new ContractId(id));
    if (!contract) throw new ContractNotFoundException();

    await this.checkRequestedContractOwnership(id, user);

    return contract.toPrimitives();
  }

  @RoleAuth([Role.Musician, Role.Client])
  async findManyByUserId(user: UserAuthInfo): Promise<ContractPrimitives[]> {
    const contracts = await this.repository.findManyByUserId(user.id);
    return contracts.map((c) => c.toPrimitives());
  }

  private async checkCreationOwnership(
    request: CreateContractRequest,
    user: UserAuthInfo,
  ) {
    const userId = await this.moduleConnectors.obtainUserIdByBookingId(
      request.bookingId,
    );
    if (!userId) {
      throw new UserIdNotFoundForBookingIdException(request.bookingId);
    }

    if (userId !== user.id) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
  }

  private async checkRequestedContractOwnership(
    requestedContractId: string,
    user: UserAuthInfo,
  ) {
    const bookingUserId =
      await this.repository.findBookingUserIdByContractId(requestedContractId);
    if (bookingUserId !== user.id) {
      throw new NotOwnerOfTheRequestedContractException(requestedContractId);
    }
  }
}

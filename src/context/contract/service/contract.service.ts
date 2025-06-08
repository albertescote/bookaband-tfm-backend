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
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";

export interface CreateContractRequest {
  bookingId: string;
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
    await this.validateCreationRequest(request, user);

    const contract = Contract.create(
      new BookingId(request.bookingId),
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

  private async validateCreationRequest(
    request: CreateContractRequest,
    user: UserAuthInfo,
  ) {
    const booking = await this.moduleConnectors.getBookingById(
      request.bookingId,
    );
    if (!booking) {
      throw new BookingNotFoundException(booking.id);
    }
    const bandMembers = await this.moduleConnectors.obtainBandMembers(
      booking.bandId,
    );

    if (!bandMembers.some((memberId) => memberId === user.id)) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
  }

  private async checkRequestedContractOwnership(
    requestedContractId: string,
    user: UserAuthInfo,
  ) {
    const bookingBandId =
      await this.repository.findBookingBandIdByContractId(requestedContractId);
    if (!bookingBandId) {
      throw new BandNotFoundException(bookingBandId);
    }
    const bandMembers =
      await this.moduleConnectors.obtainBandMembers(bookingBandId);
    if (!bandMembers.some((memberId) => memberId === user.id)) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
  }
}

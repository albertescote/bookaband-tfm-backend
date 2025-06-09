import { Injectable } from "@nestjs/common";
import { InvoiceRepository } from "../infrastructure/invoice.repository";
import { Invoice, InvoicePrimitives } from "../domain/invoice";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import InvoiceId from "../domain/invoiceId";
import ContractId from "../../shared/domain/contractId";
import { InvoiceStatus } from "../domain/invoiceStatus";
import { InvoiceNotFoundException } from "../exceptions/invoiceNotFoundException";
import { UnableToCreateInvoiceException } from "../exceptions/unableToCreateInvoiceException";
import { NotOwnerOfTheRequestedInvoiceException } from "../exceptions/notOwnerOfTheRequestedInvoiceException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotOwnerOfTheRequestedContractException } from "../exceptions/notOwnerOfTheRequestedContractException";
import { UserIdNotFoundForBookingIdException } from "../exceptions/userIdNotFoundForBookingIdException";
import { BookingNotFoundForContractIdException } from "../exceptions/bookingNotFoundForContractIdException";
import { NotOwnerOfTheRequestedBandException } from "../exceptions/notOwnerOfTheRequestedBandException";

export interface CreateInvoiceRequest {
  contractId: string;
  fileUrl: string;
}

export interface UpdateInvoiceRequest {
  id: string;
  status: InvoiceStatus;
}

@Injectable()
export class InvoiceService {
  constructor(
    private readonly repository: InvoiceRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  @RoleAuth([Role.Client, Role.Musician])
  async create(
    user: UserAuthInfo,
    request: CreateInvoiceRequest,
  ): Promise<InvoicePrimitives> {
    const booking = await this.moduleConnectors.getBookingByContractId(
      request.contractId,
    );
    if (!booking) {
      throw new BookingNotFoundForContractIdException(request.contractId);
    }
    await this.checkCreationOwnership(request, user, booking.id);

    // TODO: add correct amount value
    const invoice = Invoice.create(
      new ContractId(request.contractId),
      100,
      request.fileUrl,
    );
    const created = await this.repository.create(invoice);
    if (!created) throw new UnableToCreateInvoiceException();

    return created.toPrimitives();
  }

  @RoleAuth([Role.Client, Role.Musician])
  async update(
    user: UserAuthInfo,
    request: UpdateInvoiceRequest,
  ): Promise<InvoicePrimitives> {
    const existing = await this.repository.findById(new InvoiceId(request.id));
    if (!existing) throw new InvoiceNotFoundException();

    await this.checkRequestedInvoiceOwnership(request.id, user);

    const updated = await this.repository.update(
      Invoice.fromPrimitives({
        ...existing.toPrimitives(),
        status: request.status,
      }),
    );

    return updated.toPrimitives();
  }

  @RoleAuth([Role.Client, Role.Musician])
  async delete(user: UserAuthInfo, id: string): Promise<void> {
    const existing = await this.repository.findById(new InvoiceId(id));
    if (!existing) throw new InvoiceNotFoundException();

    await this.checkRequestedInvoiceOwnership(id, user);

    await this.repository.delete(new InvoiceId(id));
  }

  @RoleAuth([Role.Client, Role.Musician])
  async findById(user: UserAuthInfo, id: string): Promise<InvoicePrimitives> {
    const invoice = await this.repository.findById(new InvoiceId(id));
    if (!invoice) throw new InvoiceNotFoundException();

    await this.checkRequestedInvoiceOwnership(id, user);

    return invoice.toPrimitives();
  }

  @RoleAuth([Role.Client])
  async findManyByUserId(user: UserAuthInfo): Promise<InvoicePrimitives[]> {
    const invoices = await this.repository.findManyByUserId(user.id);
    return invoices.map((i) => i.toPrimitives());
  }

  @RoleAuth([Role.Musician])
  async findManyByBand(
    user: UserAuthInfo,
    bandId: string,
  ): Promise<InvoicePrimitives[]> {
    const memberIds = await this.moduleConnectors.obtainBandMembers(bandId);
    if (!memberIds.some((memberId) => memberId === user.id)) {
      throw new NotOwnerOfTheRequestedBandException(bandId);
    }
    const invoices = await this.repository.findManyByBandId(bandId);
    return invoices.map((i) => i.toPrimitives());
  }

  private async checkCreationOwnership(
    request: CreateInvoiceRequest,
    user: UserAuthInfo,
    bookingId: string,
  ) {
    const userId =
      await this.moduleConnectors.obtainUserIdByBookingId(bookingId);

    if (!userId) {
      throw new UserIdNotFoundForBookingIdException(bookingId);
    }

    if (userId !== user.id) {
      throw new NotOwnerOfTheRequestedContractException(request.contractId);
    }
  }

  private async checkRequestedInvoiceOwnership(
    requestedInvoiceId: string,
    user: UserAuthInfo,
  ) {
    if (user.role === Role.Client) {
      const invoiceUserId =
        await this.repository.findBookingUserIdFromInvoiceId(
          requestedInvoiceId,
        );
      if (invoiceUserId !== user.id) {
        throw new NotOwnerOfTheRequestedInvoiceException(requestedInvoiceId);
      }
    } else {
      const invoiceBandId =
        await this.repository.findBookingBandIdIdFromInvoiceId(
          requestedInvoiceId,
        );
      const memberIds =
        await this.moduleConnectors.obtainBandMembers(invoiceBandId);
      if (!memberIds.some((memberId) => memberId === user.id)) {
        throw new NotOwnerOfTheRequestedInvoiceException(requestedInvoiceId);
      }
    }
  }
}

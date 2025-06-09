import { Injectable } from "@nestjs/common";
import { ContractRepository } from "../infrastructure/contract.repository";
import { Contract, ContractPrimitives } from "../domain/contract";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import ContractId from "../../shared/domain/contractId";
import { ContractNotFoundException } from "../exceptions/contractNotFoundException";
import { ContractStatus } from "../domain/contractStatus";
import BookingId from "../../shared/domain/bookingId";
import { UnableToCreateContractException } from "../exceptions/unableToCreateContractException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import BandId from "../../shared/domain/bandId";
import { NotOwnerOfTheRequestedContractException } from "../exceptions/notOwnerOfTheRequestedContractException";
import { NotAMemberOfTheRequestedBandException } from "../exceptions/notAMemberOfTheRequestedBandException";
import { VidsignerApiWrapper } from "../infrastructure/vidsignerApiWrapper";
import { EXTERNAL_URL } from "../../../config";

export interface CreateContractRequest {
  bookingId: string;
  fileUrl: string;
  vidsignerDocGui: string;
}

export interface UpdateContractRequest {
  id: string;
  status: ContractStatus;
  fileUrl: string;
}

export interface SignatureNotificationRequest {
  Signers: {
    SignerGUI: string;
    SignerName: string;
    SignatureStatus: string;
    TypeOfID: string;
    NumberID: string;
    OperationTime: string;
    RejectionReason?: string | null;
    UserNoticesInfo?: string | null;
    FormInfo?: string | null;
  }[];
  FileName: string;
  DocGUI: string;
  DocStatus: string;
  Downloaded: boolean;
  AdditionalData?: string;
}

@Injectable()
export class ContractService {
  constructor(
    private readonly repository: ContractRepository,
    private readonly moduleConnectors: ModuleConnectors,
    private readonly vidSignerApiWrapper: VidsignerApiWrapper,
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
      request.vidsignerDocGui,
    );
    const created = await this.repository.create(contract);
    if (!created) throw new UnableToCreateContractException();

    return created.toPrimitivesWithoutDocGui();
  }

  @RoleAuth([Role.Musician])
  async update(
    user: UserAuthInfo,
    request: UpdateContractRequest,
  ): Promise<ContractPrimitives> {
    const existing = await this.repository.findById(new ContractId(request.id));
    if (!existing) throw new ContractNotFoundException();

    await this.checkRequestedContractBandMembership(request.id, user);

    const updated = await this.repository.update(
      Contract.fromPrimitives({
        ...existing.toPrimitives(),
        status: request.status,
        fileUrl: request.fileUrl,
      }),
    );

    return updated.toPrimitivesWithoutDocGui();
  }

  @RoleAuth([Role.Musician])
  async delete(user: UserAuthInfo, id: string): Promise<void> {
    const existing = await this.repository.findById(new ContractId(id));
    if (!existing) throw new ContractNotFoundException();

    await this.checkRequestedContractBandMembership(id, user);

    await this.repository.delete(new ContractId(id));
  }

  @RoleAuth([Role.Musician, Role.Client])
  async findById(user: UserAuthInfo, id: string): Promise<ContractPrimitives> {
    const contract = await this.repository.findById(new ContractId(id));
    if (!contract) throw new ContractNotFoundException();

    if (user.role === Role.Client) {
      await this.checkRequestedContractUserOwnership(
        contract.getBookingId(),
        user,
        id,
      );
    } else {
      await this.checkRequestedContractBandMembership(id, user);
    }

    return contract.toPrimitivesWithoutDocGui();
  }

  @RoleAuth([Role.Client])
  async findManyByUserId(user: UserAuthInfo): Promise<ContractPrimitives[]> {
    const contracts = await this.repository.findManyByUserId(user.id);
    return contracts.map((c) => c.toPrimitivesWithoutDocGui());
  }

  @RoleAuth([Role.Musician])
  async findManyByBand(
    user: UserAuthInfo,
    bandId: string,
  ): Promise<ContractPrimitives[]> {
    const bandMembers = await this.moduleConnectors.obtainBandMembers(bandId);
    if (!bandMembers.some((memberId) => memberId === user.id)) {
      throw new NotAMemberOfTheRequestedBandException(bandId);
    }
    const contracts = await this.repository.findManyByBandId(
      new BandId(bandId),
    );
    return contracts.map((c) => c.toPrimitivesWithoutDocGui());
  }

  async processSignatureNotification(
    body: SignatureNotificationRequest,
  ): Promise<void> {
    const contract = await this.repository.findByVidSignerDocGui(body.DocGUI);
    if (!contract) {
      return;
    }
    let modified = false;
    body.Signers.forEach((signer) => {
      if (signer.SignatureStatus === "Signed") {
        if (contract.toPrimitives().userName === signer.SignerName) {
          if (!contract.isUserSigned()) {
            contract.setUserSigned();
            modified = true;
          }
        } else if (!contract.isBandSigned()) {
          contract.setBandSigned();
          modified = true;
        }
      } else if (signer.SignatureStatus === "Rejected") {
        contract.failedSignature();
      }
    });
    if (modified) {
      const signedDocument = await this.vidSignerApiWrapper.getDocument(
        body.DocGUI,
      );
      const fileName = `contract-${contract.toPrimitives().bookingId}-${Date.now()}.pdf`;
      await this.moduleConnectors.storeFile(fileName, signedDocument);

      contract.updateFileUrl(`${EXTERNAL_URL}/files/${fileName}`);
    }

    await this.repository.update(contract);
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

  private async checkRequestedContractBandMembership(
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
      throw new NotOwnerOfTheRequestedContractException(requestedContractId);
    }
  }

  private async checkRequestedContractUserOwnership(
    bookingId: BookingId,
    user: UserAuthInfo,
    requestedContractId: string,
  ) {
    const booking = await this.moduleConnectors.getBookingById(
      bookingId.toPrimitive(),
    );
    if (!booking) {
      throw new BookingNotFoundException(bookingId.toPrimitive());
    }

    if (booking.userId !== user.id) {
      throw new NotOwnerOfTheRequestedContractException(requestedContractId);
    }
  }
}

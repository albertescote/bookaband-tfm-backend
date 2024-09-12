import { Injectable } from '@nestjs/common';
import Offer from '../domain/offer';
import OfferId from '../domain/offerId';
import { OfferRepository } from '../infrastructure/offerRepository';
import { SupportedAlgorithms } from '../domain/supportedAlgorithms';
import { ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET } from '../config';
import { Role } from '../../shared/domain/role';
import { VideoPayload } from '../domain/payload';
import { SignatureOptions } from '../domain/signatureOptions';
import RsaSigner from '../../shared/infrastructure/rsaSigner';
import { ModuleConnectors } from '../../shared/infrastructure/moduleConnectors';
import { UserAuthInfo } from '../../shared/domain/userAuthInfo';
import { WrongPermissionsException } from '../exceptions/wrongPermissionsException';
import { OfferNotFoundException } from '../exceptions/offerNotFoundException';
import { NotAbleToExecuteOfferDbTransactionException } from '../exceptions/notAbleToExecuteOfferDbTransactionException';
import UserId from '../../shared/domain/userId';
import { InvalidStudentIdException } from '../exceptions/invalidStudentIdException';
import { InvalidRoleForRequestedStudentException } from '../exceptions/invalidRoleForRequestedStudentException';

export interface OfferRequest {
  topic: string;
  studentId: string;
  expirationSeconds?: number;
}

export interface CreateOfferResponse {
  id: string;
  topic: string;
  studentId: string;
  signature: string;
}

export interface OfferResponse {
  id: string;
  topic: string;
  studentId: string;
}

@Injectable()
export class OfferService {
  constructor(
    private offerRepository: OfferRepository,
    private rsaSigner: RsaSigner,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async create(
    request: OfferRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<CreateOfferResponse> {
    const owner = await this.moduleConnectors.obtainUserInformation(
      userAuthInfo.id,
    );
    const ownerParsedRole = owner.getRole();
    if (ownerParsedRole !== Role.Teacher) {
      throw new WrongPermissionsException('create offer');
    }
    await this.checkStudent(request.studentId);
    const offer = new Offer(
      OfferId.generate(),
      request.topic,
      new UserId(userAuthInfo.id),
      new UserId(request.studentId),
    );
    const storedOffer = this.offerRepository.addOffer(offer);
    if (!storedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(`store offer`);
    }
    return {
      ...storedOffer.toPrimitives(),
      signature: this.signature(
        request.topic,
        ownerParsedRole,
        request.expirationSeconds,
      ),
    };
  }

  getById(id: string, userAuthInfo: UserAuthInfo): OfferResponse {
    const storedOffer = this.offerRepository.getOfferById(
      new OfferId(id),
    );
    if (!storedOffer) {
      throw new OfferNotFoundException(id);
    }
    if (
      storedOffer.toPrimitives().ownerId !== userAuthInfo.id &&
      storedOffer.toPrimitives().studentId !== userAuthInfo.id
    ) {
      throw new WrongPermissionsException('get offer');
    }
    if (storedOffer) return storedOffer.toPrimitives();
  }

  getAll(userAuthInfo: UserAuthInfo): OfferResponse[] {
    const offers = this.offerRepository.getAllOffers();
    if (userAuthInfo.role === Role.Teacher) {
      return this.getTeacherOffers(offers, userAuthInfo.id) ?? [];
    }
    if (userAuthInfo.role === Role.Student) {
      return this.getStudentOffers(offers, userAuthInfo.id) ?? [];
    }
    return [];
  }

  async update(
    id: string,
    request: OfferRequest,
    userAuthInfo: UserAuthInfo,
  ): Promise<OfferResponse> {
    const oldOffer = this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    if (oldOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException('update offer');
    }
    if (request.studentId !== oldOffer.toPrimitives().studentId) {
      await this.checkStudent(request.studentId);
    }
    const updatedOffer = this.offerRepository.updateOffer(
      new OfferId(id),
      Offer.fromPrimitives({
        ...request,
        id,
        ownerId: userAuthInfo.id,
      }),
    );
    if (!updatedOffer) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `update offer (${id})`,
      );
    }
    return updatedOffer.toPrimitives();
  }

  deleteById(id: string, userAuthInfo: UserAuthInfo): void {
    const oldOffer = this.offerRepository.getOfferById(new OfferId(id));
    if (!oldOffer) {
      throw new OfferNotFoundException(id);
    }
    if (oldOffer.toPrimitives().ownerId !== userAuthInfo.id) {
      throw new WrongPermissionsException('delete offer');
    }
    const deleted = this.offerRepository.deleteOffer(new OfferId(id));
    if (!deleted) {
      throw new NotAbleToExecuteOfferDbTransactionException(
        `delete offer (${id})`,
      );
    }
    return;
  }

  private getTeacherOffers(
    offers: Offer[],
    userId: string,
  ): OfferResponse[] {
    return offers
      .filter((offer) => offer.toPrimitives().ownerId === userId)
      .map((offer) => offer.toPrimitives());
  }

  private getStudentOffers(
    offers: Offer[],
    userId: string,
  ): OfferResponse[] {
    return offers
      .filter((offer) => offer.toPrimitives().studentId === userId)
      .map((offer) => offer.toPrimitives());
  }

  private signature(
    topic: string,
    role: Role,
    expirationSeconds: number,
  ): string {
    const iat = Math.floor(Date.now() / 1000);
    const exp = expirationSeconds ? iat + expirationSeconds : iat + 60 * 60 * 2;
    const header = { alg: SupportedAlgorithms.HS256, typ: 'JWT' };
    const payload = {
      app_key: ZOOM_MEETING_SDK_KEY,
      role_type: role === Role.Student ? 0 : 1,
      tpc: topic,
      version: 1,
      iat,
      exp,
    } as VideoPayload;
    const signatureOptions: SignatureOptions = {
      alg: SupportedAlgorithms.HS256,
      header: header,
      payload: payload,
      secret: ZOOM_MEETING_SDK_SECRET,
    };
    return this.rsaSigner.sign(signatureOptions);
  }

  private async checkStudent(studentId: string) {
    const student =
      await this.moduleConnectors.obtainUserInformation(studentId);
    if (!student) {
      throw new InvalidStudentIdException(studentId);
    }
    if (student.getRole() !== Role.Student) {
      throw new InvalidRoleForRequestedStudentException(studentId);
    }
  }
}

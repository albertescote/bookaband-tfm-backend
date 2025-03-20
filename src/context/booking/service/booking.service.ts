import { BookingStatus } from "../domain/bookingStatus";
import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { Booking, BookingPrimitives } from "../domain/booking";
import { BookingRepository } from "../infrastructure/booking.repository";
import { Injectable } from "@nestjs/common";
import OfferId from "../../shared/domain/offerId";
import UserId from "../../shared/domain/userId";
import BookingId from "../domain/bookingId";
import { Role } from "../../shared/domain/role";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { WrongPermissionsException } from "../exceptions/wrongPermissionsException";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import { OfferNotFoundException } from "../exceptions/offerNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";

export interface CreateBookingRequest {
  offerId: string;
  status: BookingStatus;
  date: Date;
}

@Injectable()
export class BookingService {
  constructor(
    private bookingRepository: BookingRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async create(
    userAuthInfo: UserAuthInfo,
    request: CreateBookingRequest,
  ): Promise<BookingPrimitives> {
    if (userAuthInfo.role !== Role.Client) {
      throw new WrongPermissionsException("create booking");
    }
    const newBooking = Booking.create(
      new OfferId(request.offerId),
      new UserId(userAuthInfo.id),
      request.date,
    );
    const storedBooking = await this.bookingRepository.save(newBooking);
    return storedBooking.toPrimitives();
  }

  async getById(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<BookingPrimitives> {
    const booking = await this.bookingRepository.findById(new BookingId(id));
    if (!booking) {
      throw new BookingNotFoundException(id);
    }
    const isOwner = await this.checkIsOwner(
      booking,
      new UserId(userAuthInfo.id),
    );
    if (!isOwner) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
    return booking.toPrimitives();
  }

  private async checkIsOwner(
    booking: Booking,
    userId: UserId,
  ): Promise<boolean> {
    if (!booking.isOwner(userId)) {
      return false;
    }
    const offer = await this.moduleConnectors.obtainOfferInformation(
      booking.toPrimitives().offerId,
    );
    if (!offer) {
      throw new OfferNotFoundException(booking.toPrimitives().id);
    }
    const bandMembers = await this.moduleConnectors.obtainBandMembers(
      offer.bandId,
    );
    if (!bandMembers) {
      throw new BandNotFoundException(booking.toPrimitives().id);
    }
    const foundMember = bandMembers.find(
      (memberId) => memberId === userId.toPrimitive(),
    );
    return !!foundMember;
  }
}

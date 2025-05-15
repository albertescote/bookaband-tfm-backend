import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { Booking, BookingPrimitives } from "../domain/booking";
import { BookingRepository } from "../infrastructure/booking.repository";
import { Injectable } from "@nestjs/common";
import OfferId from "../../shared/domain/offerId";
import UserId from "../../shared/domain/userId";
import BookingId from "../../shared/domain/bookingId";
import { Role } from "../../shared/domain/role";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import { OfferNotFoundException } from "../exceptions/offerNotFoundException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import BandId from "../../shared/domain/bandId";
import { NotOwnerOfTheRequestedBandException } from "../exceptions/notOwnerOfTheRequestedBandException";
import { BookingAlreadyProcessedException } from "../exceptions/bookingAlreadyProcessedException";
import { BookingWithDetailsPrimitives } from "../domain/bookingWithDetails";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";

export interface CreateBookingRequest {
  offerId: string;
  date: string;
}

@Injectable()
export class BookingService {
  constructor(
    private bookingRepository: BookingRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  @RoleAuth([Role.Client])
  async create(
    userAuthInfo: UserAuthInfo,
    request: CreateBookingRequest,
  ): Promise<BookingPrimitives> {
    const newBooking = Booking.create(
      new OfferId(request.offerId),
      new UserId(userAuthInfo.id),
      new Date(request.date),
    );
    const storedBooking = await this.bookingRepository.save(newBooking);
    return storedBooking.toPrimitives();
  }

  @RoleAuth([Role.Musician, Role.Client, Role.Provider])
  async getById(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<BookingWithDetailsPrimitives> {
    const bookingWithDetails = await this.bookingRepository.findByIdWithDetails(
      new BookingId(id),
    );
    if (!bookingWithDetails) {
      throw new BookingNotFoundException(id);
    }
    const isOwner = bookingWithDetails.isOwner(new UserId(userAuthInfo.id));
    const isBandMember = await this.checkIsBandMember(
      bookingWithDetails.getOfferId(),
      bookingWithDetails.getId(),
      new UserId(userAuthInfo.id),
    );
    if (!isOwner && !isBandMember) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
    return bookingWithDetails.toPrimitives();
  }

  @RoleAuth([Role.Client])
  async getAllFromClient(
    user: UserAuthInfo,
  ): Promise<BookingWithDetailsPrimitives[]> {
    const bookings = await this.bookingRepository.findAllByUserId(
      new UserId(user.id),
    );
    return bookings.map((booking) => {
      return booking.toPrimitives();
    });
  }

  @RoleAuth([Role.Musician])
  async getAllFromBand(
    user: UserAuthInfo,
    bandId: string,
  ): Promise<BookingWithDetailsPrimitives[]> {
    const members = await this.moduleConnectors.obtainBandMembers(bandId);
    const isMember = members.find((member) => member === user.id);
    if (!isMember) {
      throw new NotOwnerOfTheRequestedBandException(bandId);
    }
    const bookings = await this.bookingRepository.findAllByBandId(
      new BandId(bandId),
    );
    return bookings.map((booking) => {
      return booking.toPrimitives();
    });
  }

  @RoleAuth([Role.Musician])
  async acceptBooking(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<BookingPrimitives> {
    const booking = await this.bookingRepository.findById(new BookingId(id));
    if (!booking) {
      throw new BookingNotFoundException(id);
    }
    const isBandMember = await this.checkIsBandMember(
      booking.getOfferId(),
      booking.getId(),
      new UserId(userAuthInfo.id),
    );
    if (!isBandMember) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
    if (!booking.isPending()) {
      throw new BookingAlreadyProcessedException();
    }
    booking.accept();
    await this.bookingRepository.save(booking);

    return booking.toPrimitives();
  }

  @RoleAuth([Role.Musician])
  async declineBooking(
    userAuthInfo: UserAuthInfo,
    id: string,
  ): Promise<BookingPrimitives> {
    const booking = await this.bookingRepository.findById(new BookingId(id));
    if (!booking) {
      throw new BookingNotFoundException(id);
    }
    const isBandMember = await this.checkIsBandMember(
      booking.getOfferId(),
      booking.getId(),
      new UserId(userAuthInfo.id),
    );
    if (!isBandMember) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
    if (!booking.isPending()) {
      throw new BookingAlreadyProcessedException();
    }
    booking.decline();
    await this.bookingRepository.save(booking);

    return booking.toPrimitives();
  }

  private async checkIsBandMember(
    offerId: OfferId,
    bookingId: BookingId,
    userId: UserId,
  ): Promise<boolean> {
    const offer = await this.moduleConnectors.obtainOfferInformation(
      offerId.toPrimitive(),
    );
    if (!offer) {
      throw new OfferNotFoundException(bookingId.toPrimitive());
    }
    const bandMembers = await this.moduleConnectors.obtainBandMembers(
      offer.bandId,
    );
    if (!bandMembers) {
      throw new BandNotFoundException(bookingId.toPrimitive());
    }
    const foundMember = bandMembers.find(
      (memberId) => memberId === userId.toPrimitive(),
    );
    return !!foundMember;
  }
}

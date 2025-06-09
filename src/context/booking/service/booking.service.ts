import { UserAuthInfo } from "../../shared/domain/userAuthInfo";
import { Booking, BookingPrimitives } from "../domain/booking";
import { BookingRepository } from "../infrastructure/booking.repository";
import { Injectable } from "@nestjs/common";
import UserId from "../../shared/domain/userId";
import BookingId from "../../shared/domain/bookingId";
import { Role } from "../../shared/domain/role";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import BandId from "../../shared/domain/bandId";
import { NotOwnerOfTheRequestedBandException } from "../exceptions/notOwnerOfTheRequestedBandException";
import { BookingAlreadyProcessedException } from "../exceptions/bookingAlreadyProcessedException";
import { BookingWithDetailsPrimitives } from "../domain/bookingWithDetails";
import { RoleAuth } from "../../shared/decorator/roleAuthorization.decorator";
import { NotAbleToCreateBookingException } from "../exceptions/notAbleToCreateBookingException";
import { ContractNotFoundForBookingIdException } from "../exceptions/contractNotFoundForBookingIdException";
import { InvoiceNotFoundForBookingIdException } from "../exceptions/invoiceNotFoundForBookingIdException";
import ContractId from "../../shared/domain/contractId";

export interface CreateBookingRequest {
  bandId: string;
  initDate: string;
  endDate: string;
  name: string;
  country: string;
  city: string;
  venue: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  eventTypeId?: string;
  isPublic?: boolean;
}

export interface BookingContractResponse {
  id: string;
  bookingId: string;
  status: string;
  fileUrl: string;
  userSigned: boolean;
  bandSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
  eventName?: string;
  bandName?: string;
  userName?: string;
  eventDate?: Date;
}

export interface BookingInvoiceResponse {
  id: string;
  contractId: string;
  amount: number;
  status: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
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
      new BandId(request.bandId),
      new UserId(userAuthInfo.id),
      new Date(request.initDate),
      new Date(request.endDate),
      request.name,
      request.country,
      request.city,
      request.venue,
      request.postalCode,
      request.addressLine1,
      request.addressLine2,
      request.eventTypeId,
      request.isPublic,
    );
    const storedBooking = await this.bookingRepository.save(newBooking);
    if (!storedBooking) {
      throw new NotAbleToCreateBookingException();
    }
    await this.moduleConnectors.addBookingToChat(
      request.bandId,
      userAuthInfo.id,
      newBooking.getId().toPrimitive(),
    );
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
      bookingWithDetails.getBandId(),
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
      booking.getBandId(),
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

    await this.moduleConnectors.generateContract(
      booking.getId().toPrimitive(),
      booking.getBandId().toPrimitive(),
      userAuthInfo,
    );

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
      booking.getBandId(),
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

  @RoleAuth([Role.Client])
  async cancelBooking(user: UserAuthInfo, id: string) {
    const booking = await this.bookingRepository.findById(new BookingId(id));
    if (!booking) {
      throw new BookingNotFoundException(id);
    }
    if (!booking.isClientOwner(new UserId(user.id))) {
      throw new NotOwnerOfTheRequestedBookingException();
    }
    if (!booking.isPending()) {
      throw new BookingAlreadyProcessedException();
    }
    booking.cancel();
    await this.bookingRepository.save(booking);

    return booking.toPrimitives();
  }

  @RoleAuth([Role.Client, Role.Musician])
  async getBookingContract(
    user: UserAuthInfo,
    id: string,
  ): Promise<BookingContractResponse> {
    const contract = await this.moduleConnectors.getContractByBookingId(id);
    if (!contract) {
      throw new ContractNotFoundForBookingIdException(id);
    }
    const bookingId = new BookingId(contract.bookingId);
    const booking = await this.bookingRepository.findById(bookingId);
    if (user.role === Role.Musician) {
      const isBandMember = await this.checkIsBandMember(
        booking.getBandId(),
        bookingId,
        new UserId(user.id),
      );
      if (!isBandMember) {
        throw new NotOwnerOfTheRequestedBookingException();
      }
    } else {
      if (booking.toPrimitives().userId !== user.id) {
        throw new NotOwnerOfTheRequestedBookingException();
      }
    }
    return contract;
  }

  @RoleAuth([Role.Client, Role.Musician])
  async getBookingInvoice(
    user: UserAuthInfo,
    id: string,
  ): Promise<BookingInvoiceResponse> {
    const invoice = await this.moduleConnectors.getInvoiceByBookingId(id);
    if (!invoice) {
      throw new InvoiceNotFoundForBookingIdException(id);
    }
    const booking = await this.bookingRepository.findByContractId(
      new ContractId(invoice.contractId),
    );
    if (user.role === Role.Musician) {
      const isBandMember = await this.checkIsBandMember(
        booking.getBandId(),
        booking.getId(),
        new UserId(user.id),
      );
      if (!isBandMember) {
        throw new NotOwnerOfTheRequestedBookingException();
      }
    } else {
      if (booking.toPrimitives().userId !== user.id) {
        throw new NotOwnerOfTheRequestedBookingException();
      }
    }
    return invoice;
  }

  private async checkIsBandMember(
    bandId: BandId,
    bookingId: BookingId,
    userId: UserId,
  ): Promise<boolean> {
    const bandMembers = await this.moduleConnectors.obtainBandMembers(
      bandId.toPrimitive(),
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

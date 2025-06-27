import { ArtistReview } from "../domain/artistReview";
import { ArtistReviewRepository } from "../infrastructure/artistReview.repository";
import { CreateArtistReviewCommand } from "./createArtistReview.command";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import BookingId from "../../shared/domain/bookingId";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { BookingStatus } from "../../shared/domain/bookingStatus";
import { UnableToCreateReviewForBookingNotPaidException } from "../exceptions/unableToCreateReviewForBookingNotPaidException";
import { RoleAuthCQRS } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import { UnableToStoreArtistReviewException } from "../exceptions/unableToStoreArtistReviewException";
import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

@Injectable()
@CommandHandler(CreateArtistReviewCommand)
export class CreateArtistReviewCommandHandler
  implements ICommandHandler<CreateArtistReviewCommand>
{
  constructor(
    private readonly artistReviewRepository: ArtistReviewRepository,
    private readonly moduleConnectors: ModuleConnectors,
  ) {}

  @RoleAuthCQRS([Role.Client])
  async execute(command: CreateArtistReviewCommand): Promise<void> {
    const { authorized, bookingId, rating, comment } = command;
    const booking = await this.moduleConnectors.getBookingById(bookingId);
    if (booking.userId !== authorized.id) {
      throw new NotOwnerOfTheRequestedBookingException(bookingId);
    }
    if (booking.status !== BookingStatus.PAID) {
      throw new UnableToCreateReviewForBookingNotPaidException(bookingId);
    }
    const artistReview = ArtistReview.create(
      rating,
      comment,
      new UserId(authorized.id),
      new BandId(booking.bandId),
      new BookingId(bookingId),
    );

    const storedReview = await this.artistReviewRepository.create(artistReview);
    if (!storedReview) {
      throw new UnableToStoreArtistReviewException();
    }
  }
}

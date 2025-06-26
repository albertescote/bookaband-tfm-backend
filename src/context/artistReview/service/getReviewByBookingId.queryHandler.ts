import { ArtistReviewRepository } from "../infrastructure/artistReview.repository";
import { GetReviewByBookingIdQuery } from "./getReviewByBookingId.query";
import { RoleAuthCQRS } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import BookingId from "../../shared/domain/bookingId";
import { ArtistReview } from "../domain/artistReview";

export class GetReviewByBookingIdQueryHandler {
  constructor(
    private readonly artistReviewRepository: ArtistReviewRepository,
  ) {}

  @RoleAuthCQRS([Role.Client])
  async execute(
    query: GetReviewByBookingIdQuery,
  ): Promise<ArtistReview | undefined> {
    const { authorized, bookingId } = query;

    const review = await this.artistReviewRepository.getReviewByBookingId(
      new BookingId(bookingId),
    );
    if (review && review.toPrimitives().userId !== authorized.id) {
      throw new NotOwnerOfTheRequestedBookingException(bookingId);
    }
    return review;
  }
}

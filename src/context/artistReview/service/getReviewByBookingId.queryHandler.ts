import { ArtistReviewRepository } from "../infrastructure/artistReview.repository";
import { GetReviewByBookingIdQuery } from "./getReviewByBookingId.query";
import { RoleAuthCQRS } from "../../shared/decorator/roleAuthorization.decorator";
import { Role } from "../../shared/domain/role";
import { NotOwnerOfTheRequestedBookingException } from "../exceptions/notOwnerOfTheRequestedBookingException";
import BookingId from "../../shared/domain/bookingId";
import { ArtistReviewPrimitives } from "../domain/artistReview";
import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

@Injectable()
@QueryHandler(GetReviewByBookingIdQuery)
export class GetReviewByBookingIdQueryHandler
  implements IQueryHandler<GetReviewByBookingIdQuery>
{
  constructor(
    private readonly artistReviewRepository: ArtistReviewRepository,
  ) {}

  @RoleAuthCQRS([Role.Client])
  async execute(
    query: GetReviewByBookingIdQuery,
  ): Promise<ArtistReviewPrimitives> {
    const { authorized, bookingId } = query;

    const review = await this.artistReviewRepository.getReviewByBookingId(
      new BookingId(bookingId),
    );
    if (review) {
      const reviewPrimitives = review.toPrimitives();
      if (reviewPrimitives.userId !== authorized.id) {
        throw new NotOwnerOfTheRequestedBookingException(bookingId);
      }
      return reviewPrimitives;
    }
    return undefined;
  }
}

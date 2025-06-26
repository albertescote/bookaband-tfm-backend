import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { ArtistReviewId } from "./artistReviewId";
import BookingId from "../../shared/domain/bookingId";

export interface ArtistReviewPrimitives {
  id: string;
  userId: string;
  bandId: string;
  bookingId: string;
  rating: number;
  comment: string;
  date: Date;
}

export class ArtistReview {
  constructor(
    private readonly id: ArtistReviewId,
    private readonly userId: UserId,
    private readonly bandId: BandId,
    private readonly bookingId: BookingId,
    private readonly rating: number,
    private readonly comment: string,
    private readonly date: Date,
  ) {}

  static create(
    rating: number,
    comment: string,
    userId: UserId,
    bandId: BandId,
    bookingId: BookingId,
  ): ArtistReview {
    return new ArtistReview(
      ArtistReviewId.generate(),
      userId,
      bandId,
      bookingId,
      rating,
      comment,
      new Date(),
    );
  }

  static fromPrimitives(primitives: ArtistReviewPrimitives): ArtistReview {
    return new ArtistReview(
      new ArtistReviewId(primitives.id),
      new UserId(primitives.userId),
      new BandId(primitives.bandId),
      new BookingId(primitives.bookingId),
      primitives.rating,
      primitives.comment,
      primitives.date,
    );
  }

  toPrimitives(): ArtistReviewPrimitives {
    return {
      id: this.id.toPrimitive(),
      userId: this.userId.toPrimitive(),
      bandId: this.bandId.toPrimitive(),
      bookingId: this.bookingId.toPrimitive(),
      rating: this.rating,
      comment: this.comment,
      date: this.date,
    };
  }
}

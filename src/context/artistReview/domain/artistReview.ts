import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";
import { ArtistReviewId } from "./artistReviewId";

export interface ArtistReviewPrimitives {
  id: string;
  userId: string;
  bandId: string;
  rating: number;
  comment: string;
  date: Date;
}

export class ArtistReview {
  constructor(
    private readonly id: ArtistReviewId,
    private readonly userId: UserId,
    private readonly bandId: BandId,
    private readonly rating: number,
    private readonly comment: string,
    private readonly date: Date,
  ) {}

  static create(
    rating: number,
    comment: string,
    userId: UserId,
    bandId: BandId,
  ): ArtistReview {
    return new ArtistReview(
      ArtistReviewId.generate(),
      userId,
      bandId,
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
      rating: this.rating,
      comment: this.comment,
      date: this.date,
    };
  }
}

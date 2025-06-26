import { PrismaClient } from "@prisma/client";
import { ArtistReview } from "../domain/artistReview";

export class ArtistReviewRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(artistReview: ArtistReview): Promise<ArtistReview> {
    const primitives = artistReview.toPrimitives();
    try {
      const storedReview = await this.prisma.artistReview.create({
        data: {
          id: primitives.id,
          bandId: primitives.bandId,
          rating: primitives.rating,
          comment: primitives.comment,
          userId: primitives.userId,
          date: new Date(primitives.date),
        },
      });
      return ArtistReview.fromPrimitives(storedReview) ?? undefined;
    } catch (e) {
      return undefined;
    }
  }
}

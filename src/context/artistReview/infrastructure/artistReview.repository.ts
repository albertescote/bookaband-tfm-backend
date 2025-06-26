import { ArtistReview } from "../domain/artistReview";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ArtistReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(artistReview: ArtistReview): Promise<ArtistReview> {
    const primitives = artistReview.toPrimitives();
    try {
      const storedReview = await this.prismaService.artistReview.create({
        data: {
          id: primitives.id,
          bandId: primitives.bandId,
          bookingId: primitives.bookingId,
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

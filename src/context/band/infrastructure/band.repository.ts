import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Band from "../domain/band";
import BandId from "../../shared/domain/bandId";
import { MusicGenre } from "../domain/musicGenre";
import UserId from "../../shared/domain/userId";
import BandWithDetails from "../domain/bandWithDetails";
import { BandProfile } from "../domain/bandProfile";
import { BandSize } from "../../offer/domain/bandSize";

export interface UserBand {
  id: string;
  name: string;
  imageUrl?: string;
}

@Injectable()
export class BandRepository {
  constructor(private prismaService: PrismaService) {}

  async addBand(band: Band): Promise<Band> {
    const primitives = band.toPrimitives();

    try {
      await this.prismaService.band.create({
        data: {
          id: primitives.id,
          name: primitives.name,
          genre: primitives.genre,
          imageUrl: primitives.imageUrl,
          bio: primitives.bio,
          followers: primitives.followers,
          following: primitives.following,
          createdAt: primitives.createdAt,
          rating: primitives.rating,
          members: {
            connect: primitives.membersId.map((id) => ({ id })),
          },
        },
      });
      return band;
    } catch {
      return undefined;
    }
  }

  async getBandById(id: BandId): Promise<Band> {
    const band = await this.prismaService.band.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        members: true,
        artistReview: true,
      },
    });

    return band
      ? Band.fromPrimitives({
          id: band.id,
          name: band.name,
          genre: MusicGenre[band.genre],
          membersId: band.members.map((m) => m.id),
          imageUrl: band.imageUrl,
          rating: band.rating,
          reviewCount: band.artistReview.length,
          bio: band.bio,
          followers: band.followers,
          following: band.following,
          createdAt: band.createdAt,
        })
      : undefined;
  }

  async updateBand(updatedBand: Band): Promise<Band> {
    const primitives = updatedBand.toPrimitives();

    try {
      await this.prismaService.band.update({
        where: { id: primitives.id },
        data: {
          name: primitives.name,
          genre: primitives.genre,
          imageUrl: primitives.imageUrl,
          rating: primitives.rating,
          bio: primitives.bio,
          followers: primitives.followers,
          following: primitives.following,
          members: {
            set: primitives.membersId.map((id) => ({ id })),
          },
        },
      });

      return updatedBand;
    } catch {
      return undefined;
    }
  }

  async deleteBand(id: BandId): Promise<boolean> {
    try {
      await this.prismaService.band.delete({ where: { id: id.toPrimitive() } });
      return true;
    } catch {
      return false;
    }
  }

  async getUserBands(userId: UserId): Promise<UserBand[]> {
    const bands = await this.prismaService.band.findMany({
      where: {
        members: {
          some: {
            id: userId.toPrimitive(),
          },
        },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
      },
    });

    return bands ?? [];
  }

  async getBandWithDetailsById(id: BandId): Promise<BandWithDetails> {
    const band = await this.prismaService.band.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        members: {
          select: {
            id: true,
            firstName: true,
            familyName: true,
            imageUrl: true,
          },
        },
      },
    });

    return band
      ? BandWithDetails.fromPrimitives({
          id: band.id,
          name: band.name,
          members: band.members.map((member) => ({
            id: member.id,
            userName: `${member.firstName} ${member.familyName}`,
            imageUrl: member.imageUrl,
          })),
          genre: MusicGenre[band.genre],
          imageUrl: band.imageUrl,
        })
      : undefined;
  }

  async getBandProfileById(id: BandId): Promise<BandProfile | undefined> {
    const band = await this.prismaService.band.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        offer: {
          include: {
            equipment: true,
            bookings: true,
          },
        },
        media: true,
        socialLink: true,
        artistReview: {
          include: {
            user: {
              select: {
                firstName: true,
                familyName: true,
                imageUrl: true,
              },
            },
          },
        },
        members: true,
      },
    });

    if (!band) return undefined;

    return {
      id: band.id,
      bandId: band.id,
      bandName: band.name,
      genre: band.genre,
      membersId: band.members.map((m) => m.id),
      bookingDates: band.offer?.bookings.map((b) => b.date.toISOString()) ?? [],
      description: band.offer?.description ?? "",
      location: band.offer?.location ?? "",
      featured: band.offer?.featured ?? false,
      bandSize: band.offer ? BandSize[band.offer.bandSize] : undefined,
      equipment: band.offer?.equipment.map((e) => e.type) ?? [],
      eventTypeIds: band.offer?.eventTypeIds ?? [],
      reviewCount: band.artistReview.length,
      createdDate: band.createdAt,
      price: band.offer?.price,
      imageUrl: band.imageUrl,
      rating: band.rating,
      bio: band.bio,
      followers: band.followers,
      following: band.following,

      reviews: band.artistReview.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        date: review.date.toISOString(),
        reviewer: {
          name: `${review.user.firstName} ${review.user.familyName}`,
          imageUrl: review.user.imageUrl,
        },
      })),

      media: band.media.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
      })),

      socialLinks: band.socialLink.map((s) => ({
        platform: s.platform,
        url: s.url,
      })),

      events:
        band.offer?.bookings.map((booking) => ({
          id: booking.id,
          name: booking.name,
          date: booking.date.toISOString(),
          eventTypeId: booking.eventTypeId,
          city: booking.city,
          country: booking.country,
          venue: booking.venue,
          isPublic: booking.isPublic ?? false,
        })) ?? [],
    };
  }
}

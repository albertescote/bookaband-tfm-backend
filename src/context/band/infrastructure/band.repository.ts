import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Band, { GasPriceCalculation, WeeklyAvailability } from "../domain/band";
import BandId from "../../shared/domain/bandId";
import { BandProfile } from "../domain/bandProfile";
import { BandRole } from "../domain/bandRole";
import UserId from "../../shared/domain/userId";
import { BandSize } from "../domain/bandSize";
import { Prisma } from "@prisma/client";
import { BandCatalogItem } from "../domain/bandCatalogItem";
import { FeaturedBand } from "../service/getFeaturedBands.queryHandler";
import { BookingStatus } from "../../shared/domain/bookingStatus";

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
          musicalStyleIds: primitives.musicalStyleIds,
          imageUrl: primitives.imageUrl,
          bio: primitives.bio,
          followers: primitives.followers,
          following: primitives.following,
          createdAt: primitives.createdAt,
          price: primitives.price,
          location: primitives.location,
          bandSize: primitives.bandSize as BandSize,
          eventTypeIds: primitives.eventTypeIds,
          featured: primitives.featured,
          visible: primitives.visible,
          weeklyAvailability:
            primitives.weeklyAvailability as unknown as Prisma.JsonValue,
          hospitalityRider: primitives.hospitalityRider
            ? {
                create: {
                  accommodation: primitives.hospitalityRider.accommodation,
                  catering: primitives.hospitalityRider.catering,
                  beverages: primitives.hospitalityRider.beverages,
                  specialRequirements:
                    primitives.hospitalityRider.specialRequirements,
                },
              }
            : undefined,
          technicalRider: primitives.technicalRider
            ? {
                create: {
                  soundSystem: primitives.technicalRider.soundSystem,
                  microphones: primitives.technicalRider.microphones,
                  backline: primitives.technicalRider.backline,
                  lighting: primitives.technicalRider.lighting,
                  otherRequirements:
                    primitives.technicalRider.otherRequirements,
                },
              }
            : undefined,
          performanceArea: primitives.performanceArea
            ? {
                create: {
                  regions: primitives.performanceArea.regions,
                  gasPriceCalculation:
                    (primitives.performanceArea
                      .gasPriceCalculation as unknown as Prisma.JsonValue) ??
                    undefined,
                  otherComments:
                    primitives.performanceArea.otherComments ?? undefined,
                },
              }
            : undefined,
          media: primitives.media
            ? {
                create: primitives.media.map((media) => ({
                  url: media.url,
                  type: media.type,
                })),
              }
            : undefined,
          socialLink: primitives.socialLinks
            ? {
                create: primitives.socialLinks.map((socialLink) => ({
                  platform: socialLink.platform,
                  url: socialLink.url,
                })),
              }
            : undefined,
          members: {
            create: primitives.members.map((member) => ({
              userId: member.id,
              role: member.role,
              createdAt: new Date(),
            })),
          },
        },
      });
      return band;
    } catch (e) {
      return undefined;
    }
  }

  async getBandById(id: BandId): Promise<Band> {
    const band = await this.prismaService.band.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                familyName: true,
                email: true,
              },
            },
          },
        },
        artistReview: true,
        hospitalityRider: true,
        technicalRider: true,
        performanceArea: true,
        media: true,
        socialLink: true,
      },
    });

    if (!band) return undefined;

    const averageRating = this.calculateAverageRating(band.artistReview);

    return Band.fromPrimitives({
      id: band.id,
      name: band.name,
      musicalStyleIds: band.musicalStyleIds,
      members: band.members.map((m) => ({
        id: m.userId,
        role: m.role as BandRole,
      })),
      imageUrl: band.imageUrl ?? undefined,
      rating: averageRating ?? undefined,
      reviewCount: band.artistReview.length,
      bio: band.bio ?? undefined,
      followers: band.followers,
      following: band.following,
      createdAt: band.createdAt,
      price: band.price,
      location: band.location,
      bandSize: band.bandSize,
      eventTypeIds: band.eventTypeIds,
      featured: band.featured,
      visible: band.visible,
      weeklyAvailability:
        band.weeklyAvailability as unknown as WeeklyAvailability,
      hospitalityRider: band.hospitalityRider
        ? {
            accommodation: band.hospitalityRider.accommodation,
            catering: band.hospitalityRider.catering,
            beverages: band.hospitalityRider.beverages,
            specialRequirements: band.hospitalityRider.specialRequirements,
          }
        : undefined,
      technicalRider: band.technicalRider
        ? {
            soundSystem: band.technicalRider.soundSystem,
            microphones: band.technicalRider.microphones,
            backline: band.technicalRider.backline,
            lighting: band.technicalRider.lighting,
            otherRequirements: band.technicalRider.otherRequirements,
          }
        : undefined,
      performanceArea: band.performanceArea
        ? {
            regions: band.performanceArea.regions,
            gasPriceCalculation:
              (band.performanceArea
                .gasPriceCalculation as unknown as GasPriceCalculation) ??
              undefined,
            otherComments: band.performanceArea.otherComments ?? undefined,
          }
        : undefined,
      media: band.media.map((m) => ({
        id: m.id,
        url: m.url,
        type: m.type,
      })),
      socialLinks: band.socialLink.map((s) => ({
        id: s.id,
        platform: s.platform,
        url: s.url,
      })),
    });
  }

  async updateBand(updatedBand: Band): Promise<Band> {
    const primitives = updatedBand.toPrimitives();

    try {
      await this.prismaService.band.update({
        where: { id: primitives.id },
        data: {
          name: primitives.name,
          musicalStyleIds: primitives.musicalStyleIds,
          imageUrl: primitives.imageUrl,
          bio: primitives.bio,
          followers: primitives.followers,
          following: primitives.following,
          price: primitives.price,
          location: primitives.location,
          bandSize: primitives.bandSize as BandSize,
          eventTypeIds: primitives.eventTypeIds,
          featured: primitives.featured,
          visible: primitives.visible,
          weeklyAvailability:
            primitives.weeklyAvailability as unknown as Prisma.JsonValue,
          hospitalityRider: primitives.hospitalityRider
            ? {
                upsert: {
                  create: {
                    accommodation: primitives.hospitalityRider.accommodation,
                    catering: primitives.hospitalityRider.catering,
                    beverages: primitives.hospitalityRider.beverages,
                    specialRequirements:
                      primitives.hospitalityRider.specialRequirements,
                  },
                  update: {
                    accommodation: primitives.hospitalityRider.accommodation,
                    catering: primitives.hospitalityRider.catering,
                    beverages: primitives.hospitalityRider.beverages,
                    specialRequirements:
                      primitives.hospitalityRider.specialRequirements,
                  },
                },
              }
            : undefined,
          technicalRider: primitives.technicalRider
            ? {
                upsert: {
                  create: {
                    soundSystem: primitives.technicalRider.soundSystem,
                    microphones: primitives.technicalRider.microphones,
                    backline: primitives.technicalRider.backline,
                    lighting: primitives.technicalRider.lighting,
                    otherRequirements:
                      primitives.technicalRider.otherRequirements,
                  },
                  update: {
                    soundSystem: primitives.technicalRider.soundSystem,
                    microphones: primitives.technicalRider.microphones,
                    backline: primitives.technicalRider.backline,
                    lighting: primitives.technicalRider.lighting,
                    otherRequirements:
                      primitives.technicalRider.otherRequirements,
                  },
                },
              }
            : undefined,
          performanceArea: primitives.performanceArea
            ? {
                upsert: {
                  create: {
                    regions: primitives.performanceArea.regions,
                    gasPriceCalculation: primitives.performanceArea
                      .gasPriceCalculation as unknown as Prisma.JsonValue,
                    otherComments: primitives.performanceArea.otherComments,
                  },
                  update: {
                    regions: primitives.performanceArea.regions,
                    gasPriceCalculation: primitives.performanceArea
                      .gasPriceCalculation as unknown as Prisma.JsonValue,
                    otherComments: primitives.performanceArea.otherComments,
                  },
                },
              }
            : undefined,
          media: {
            deleteMany: {},
            create:
              primitives.media?.map((media) => ({
                url: media.url,
                type: media.type,
              })) || [],
          },
          socialLink: {
            deleteMany: {},
            create:
              primitives.socialLinks?.map((socialLink) => ({
                platform: socialLink.platform,
                url: socialLink.url,
              })) || [],
          },
          members: {
            deleteMany: {},
            create: primitives.members.map((member) => ({
              userId: member.id,
              role: member.role,
              createdAt: new Date(),
            })),
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
            userId: userId.toPrimitive(),
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

  async getBandProfileById(id: BandId): Promise<BandProfile | undefined> {
    const band = await this.prismaService.band.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        bookings: true,
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                familyName: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
        hospitalityRider: true,
        technicalRider: true,
        performanceArea: true,
      },
    });

    if (!band) return undefined;

    const averageRating = this.calculateAverageRating(band.artistReview);

    return {
      id: band.id,
      name: band.name,
      musicalStyleIds: band.musicalStyleIds,
      members: band.members.map((m) => {
        return {
          id: m.userId,
          role: m.role as BandRole,
          name: `${m.user.firstName} ${m.user.familyName}`,
          imageUrl: m.user.imageUrl ?? undefined,
        };
      }),
      bookingDates: band.bookings.map((b) => b.initDate.toISOString()),
      location: band.location,
      featured: band.featured,
      bandSize: band.bandSize as BandSize,
      eventTypeIds: band.eventTypeIds,
      reviewCount: band.artistReview.length,
      createdDate: band.createdAt,
      price: band.price,
      imageUrl: band.imageUrl ?? undefined,
      rating: averageRating ?? undefined,
      bio: band.bio ?? undefined,
      followers: band.followers,
      following: band.following,
      weeklyAvailability:
        band.weeklyAvailability as unknown as WeeklyAvailability,
      hospitalityRider: band.hospitalityRider
        ? {
            accommodation: band.hospitalityRider.accommodation,
            catering: band.hospitalityRider.catering,
            beverages: band.hospitalityRider.beverages,
            specialRequirements: band.hospitalityRider.specialRequirements,
          }
        : undefined,
      technicalRider: band.technicalRider
        ? {
            soundSystem: band.technicalRider.soundSystem,
            microphones: band.technicalRider.microphones,
            backline: band.technicalRider.backline,
            lighting: band.technicalRider.lighting,
            otherRequirements: band.technicalRider.otherRequirements,
          }
        : undefined,
      performanceArea: band.performanceArea
        ? {
            regions: band.performanceArea.regions,
            gasPriceCalculation:
              (band.performanceArea
                .gasPriceCalculation as unknown as GasPriceCalculation) ??
              undefined,
            otherComments: band.performanceArea.otherComments ?? undefined,
          }
        : undefined,
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
        id: s.id,
        platform: s.platform,
        url: s.url,
      })),
      events: band.bookings.map((booking) => ({
        id: booking.id,
        name: booking.name,
        date: booking.initDate.toISOString(),
        eventTypeId: booking.eventTypeId,
        city: booking.city,
        country: booking.country,
        venue: booking.venue,
        isPublic: booking.isPublic,
        status: booking.status as BookingStatus,
      })),
    };
  }

  async getFilteredBandCatalogItems(
    page: number,
    pageSize: number,
    filters?: { date?: string; location?: string; searchQuery?: string },
  ): Promise<{ bandCatalogItems: BandCatalogItem[]; total: number }> {
    const whereClause: any = {
      visible: true,
      ...(filters?.location && {
        location: {
          contains: filters.location,
          mode: "insensitive",
        },
      }),
      ...(filters?.searchQuery && {
        name: {
          contains: filters.searchQuery,
          mode: "insensitive",
        },
      }),
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const allBands = await this.prismaService.band.findMany({
      where: whereClause,
      include: {
        artistReview: true,
        bookings: true,
        hospitalityRider: true,
        technicalRider: true,
        performanceArea: true,
      },
      orderBy: {
        featured: "desc",
      },
    });

    const filteredBands = filters?.date
      ? allBands.filter(
          (band) =>
            !band.bookings.some(
              (b) =>
                b.status === "ACCEPTED" &&
                b.initDate.toISOString().split("T")[0] === filters.date,
            ),
        )
      : allBands;

    const total = filteredBands.length;

    const pagedBands = filteredBands.slice(skip, skip + take);

    const mappedBands: BandCatalogItem[] = pagedBands.map((band) => ({
      id: band.id,
      name: band.name,
      musicalStyleIds: band.musicalStyleIds,
      bookingDates: band.bookings
        .filter((b) => b.status === "ACCEPTED")
        .map((b) => b.initDate.toISOString()),
      weeklyAvailability:
        band.weeklyAvailability as unknown as WeeklyAvailability,
      location: band.location,
      featured: band.featured,
      bandSize: band.bandSize as BandSize,
      eventTypeIds: band.eventTypeIds,
      reviewCount: band.artistReview.length,
      bio: band.bio ?? undefined,
      price: band.price,
      imageUrl: band.imageUrl || undefined,
      rating: this.calculateAverageRating(band.artistReview) || undefined,
      hospitalityRider: band.hospitalityRider ?? undefined,
      technicalRider: band.technicalRider ?? undefined,
      performanceArea: {
        id: band.performanceArea.id,
        regions: band.performanceArea.regions,
        gasPriceCalculation:
          (band.performanceArea
            .gasPriceCalculation as unknown as GasPriceCalculation) ??
          undefined,
        otherComments: band.performanceArea.otherComments ?? undefined,
      },
    }));

    return {
      bandCatalogItems: mappedBands,
      total,
    };
  }

  async getFeaturedBands(
    page: number,
    pageSize: number,
  ): Promise<{ featuredBands: FeaturedBand[]; total: number }> {
    const whereClause: any = {
      visible: true,
      featured: true,
    };

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [bands, total] = await Promise.all([
      this.prismaService.band.findMany({
        where: whereClause,
        include: {
          bookings: true,
          members: true,
        },
        skip,
        take,
      }),
      this.prismaService.band.count({
        where: whereClause,
      }),
    ]);

    return {
      featuredBands: bands.map((band) => ({
        id: band.id,
        name: band.name,
        musicalStyleIds: band.musicalStyleIds,
        price: band.price,
        imageUrl: band.imageUrl ?? undefined,
        bio: band.bio ?? undefined,
      })),
      total,
    };
  }

  private calculateAverageRating(reviews: { rating: number }[]): number | null {
    if (reviews.length === 0) return null;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }
}

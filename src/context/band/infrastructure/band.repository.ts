import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Band, { WeeklyAvailability } from "../domain/band";
import BandId from "../../shared/domain/bandId";
import BandWithDetails from "../domain/bandWithDetails";
import { BandProfile } from "../domain/bandProfile";
import { BandRole } from "../domain/bandRole";
import UserId from "../../shared/domain/userId";
import { BandSize } from "../domain/bandSize";
import { Prisma } from "@prisma/client";

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
          rating: primitives.rating,
          price: primitives.price,
          description: primitives.description,
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
                  travelPreferences:
                    primitives.performanceArea.travelPreferences,
                  restrictions: primitives.performanceArea.restrictions,
                },
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
    } catch {
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
      },
    });

    if (!band) return undefined;

    return Band.fromPrimitives({
      id: band.id,
      name: band.name,
      musicalStyleIds: band.musicalStyleIds,
      members: band.members.map((m) => ({
        id: m.userId,
        role: m.role as BandRole,
      })),
      imageUrl: band.imageUrl,
      rating: band.rating,
      reviewCount: band.artistReview.length,
      bio: band.bio,
      followers: band.followers,
      following: band.following,
      createdAt: band.createdAt,
      price: band.price,
      description: band.description,
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
            travelPreferences: band.performanceArea.travelPreferences,
            restrictions: band.performanceArea.restrictions,
          }
        : undefined,
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
          rating: primitives.rating,
          bio: primitives.bio,
          followers: primitives.followers,
          following: primitives.following,
          price: primitives.price,
          description: primitives.description,
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
                    travelPreferences:
                      primitives.performanceArea.travelPreferences,
                    restrictions: primitives.performanceArea.restrictions,
                  },
                  update: {
                    regions: primitives.performanceArea.regions,
                    travelPreferences:
                      primitives.performanceArea.travelPreferences,
                    restrictions: primitives.performanceArea.restrictions,
                  },
                },
              }
            : undefined,
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

  async getBandWithDetailsById(id: BandId): Promise<BandWithDetails> {
    const band = await this.prismaService.band.findFirst({
      where: { id: id.toPrimitive() },
      include: {
        members: {
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
      },
    });

    if (!band) return undefined;

    return BandWithDetails.fromPrimitives({
      id: band.id,
      name: band.name,
      members: band.members.map((member) => ({
        id: member.userId,
        userName: `${member.user.firstName} ${member.user.familyName}`,
        imageUrl: member.user.imageUrl,
        role: member.role as BandRole,
      })),
      musicalStyleIds: band.musicalStyleIds,
      imageUrl: band.imageUrl,
    });
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

    return {
      id: band.id,
      bandId: band.id,
      bandName: band.name,
      musicalStyleIds: band.musicalStyleIds,
      membersId: band.members.map((m) => m.userId),
      bookingDates: band.bookings.map((b) => b.date.toISOString()),
      description: band.description,
      location: band.location,
      featured: band.featured,
      bandSize: band.bandSize as BandSize,
      equipment: [], // Empty array since equipment is not part of the band model
      eventTypeIds: band.eventTypeIds,
      reviewCount: band.artistReview.length,
      createdDate: band.createdAt,
      price: band.price,
      imageUrl: band.imageUrl,
      rating: band.rating,
      bio: band.bio,
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
            travelPreferences: band.performanceArea.travelPreferences,
            restrictions: band.performanceArea.restrictions,
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
        platform: s.platform,
        url: s.url,
      })),
      events: band.bookings.map((booking) => ({
        id: booking.id,
        name: booking.name,
        date: booking.date.toISOString(),
        eventTypeId: booking.eventTypeId,
      })),
    };
  }
}

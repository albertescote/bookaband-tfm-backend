import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Band from "../domain/band";
import BandId from "../../shared/domain/bandId";
import { MusicGenre } from "../domain/musicGenre";
import UserId from "../../shared/domain/userId";
import BandWithDetails from "../domain/bandWithDetails";

export interface UserBand {
  id: string;
  name: string;
  offer?: {
    id: string;
    bandId: string;
    price: number;
    visible: boolean;
    description?: string;
  };
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
          location: primitives.location,
          rating: primitives.rating,
          reviewCount: primitives.reviewCount,
          featured: primitives.featured,
          bandSize: primitives.bandSize,
          members: {
            connect: primitives.membersId.map((id) => ({ id })),
          },
          availableEvents: {
            connect: primitives.eventTypeIds.map((id) => ({ id })),
          },
          equipment: {
            create: primitives.equipment.map((e) => ({
              id: e.id,
              type: e.type,
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
        members: true,
        availableEvents: true,
        equipment: true,
      },
    });

    return band
      ? Band.fromPrimitives({
          id: band.id,
          name: band.name,
          genre: MusicGenre[band.genre],
          membersId: band.members.map((m) => m.id),
          imageUrl: band.imageUrl,
          location: band.location,
          rating: band.rating,
          reviewCount: band.reviewCount,
          featured: band.featured,
          bandSize: band.bandSize,
          eventTypeIds: band.availableEvents.map((eventType) => eventType.id),
          equipment: band.equipment,
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
          location: primitives.location,
          rating: primitives.rating,
          reviewCount: primitives.reviewCount,
          featured: primitives.featured,
          bandSize: primitives.bandSize,
          members: {
            set: primitives.membersId.map((id) => ({ id })),
          },
          availableEvents: {
            set: primitives.eventTypeIds.map((id) => ({ id })),
          },
          equipment: {
            deleteMany: {},
            create: primitives.equipment.map((e) => ({
              id: e.id,
              type: e.type,
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
            id: userId.toPrimitive(),
          },
        },
      },
      select: {
        id: true,
        name: true,
        offer: true,
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
}

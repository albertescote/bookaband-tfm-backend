import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import Band from "../domain/band";
import BandId from "../../shared/domain/bandId";
import { MusicGenre } from "../domain/musicGenre";
import UserId from "../../shared/domain/userId";

export interface UserBand {
  id: string;
  name: string;
  offer?: {
    id: string;
    bandId: string;
    price: number;
    description?: string;
  };
}

@Injectable()
export class BandRepository {
  constructor(private prismaService: PrismaService) {}

  async addBand(band: Band): Promise<Band> {
    const bandPrimitives = band.toPrimitives();
    try {
      await this.prismaService.band.create({
        data: {
          id: bandPrimitives.id,
          name: bandPrimitives.name,
          genre: bandPrimitives.genre,
          imageUrl: bandPrimitives.imageUrl,
          members: {
            connect: bandPrimitives.membersId.map((memberId: string) => ({
              id: memberId,
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
        members: true,
      },
    });
    return band
      ? Band.fromPrimitives({
          id: band.id,
          name: band.name,
          membersId: band.members.map((member) => member.id),
          genre: MusicGenre[band.genre],
          imageUrl: band.imageUrl,
        })
      : undefined;
  }

  async getAllBands(): Promise<Band[]> {
    const bands = await this.prismaService.band.findMany({
      include: { members: true },
    });
    return bands.map((band) => {
      return Band.fromPrimitives({
        id: band.id,
        name: band.name,
        membersId: band.members.map((member) => member.id),
        genre: MusicGenre[band.genre],
        imageUrl: band.imageUrl,
      });
    });
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

  async updateBand(updatedBand: Band): Promise<Band> {
    try {
      const bandPrimitives = updatedBand.toPrimitives();
      await this.prismaService.band.update({
        where: { id: bandPrimitives.id },
        data: {
          id: bandPrimitives.id,
          name: bandPrimitives.name,
          genre: bandPrimitives.genre,
          imageUrl: bandPrimitives.imageUrl,
          members: {
            connect: bandPrimitives.membersId.map((memberId: string) => ({
              id: memberId,
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
      await this.prismaService.band.delete({
        where: { id: id.toPrimitive() },
      });
      return true;
    } catch {
      return false;
    }
  }
}

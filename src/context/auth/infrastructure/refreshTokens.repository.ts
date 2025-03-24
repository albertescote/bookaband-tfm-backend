import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import { RefreshToken } from "../domain/refreshToken";

@Injectable()
export class RefreshTokensRepository {
  constructor(private prismaService: PrismaService) {}

  async createRefreshToken(refreshToken: RefreshToken): Promise<RefreshToken> {
    const createdRefreshToken = await this.prismaService.refreshToken.create({
      data: refreshToken.toPrimitives(),
    });
    return RefreshToken.fromPrimitives(createdRefreshToken);
  }

  async findRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: { token },
    });
    return refreshToken ? RefreshToken.fromPrimitives(refreshToken) : undefined;
  }

  async deleteRefreshToken(token: string): Promise<boolean> {
    try {
      await this.prismaService.refreshToken.delete({
        where: { token },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}

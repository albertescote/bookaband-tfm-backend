import { Injectable } from "@nestjs/common";
import User from "../../shared/domain/user";
import UserId from "../../shared/domain/userId";
import PrismaService from "../../shared/infrastructure/db/prisma.service";

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async addUser(user: User): Promise<User> {
    const userPrimitives = user.toPrimitives();
    try {
      await this.prismaService.user.create({
        data: {
          id: userPrimitives.id,
          firstName: userPrimitives.firstName,
          familyName: userPrimitives.familyName,
          email: userPrimitives.email,
          password: userPrimitives.password,
          role: userPrimitives.role.toString(),
          imageUrl: userPrimitives.imageUrl,
        },
      });
      return user;
    } catch (e) {
      return undefined;
    }
  }

  async getUserById(id: UserId): Promise<User> {
    const result = await this.prismaService.user.findFirst({
      where: { id: id.toPrimitive() },
      include: { emailVerification: { select: { verified: true } } },
    });
    return result
      ? User.fromPrimitives({
          ...result,
          emailVerified: result.password
            ? result.emailVerification.verified
            : true,
        })
      : undefined;
  }

  async getUserByEmail(email: string): Promise<User> {
    const result = await this.prismaService.user.findFirst({
      where: { email: email },
      include: { emailVerification: { select: { verified: true } } },
    });
    return result
      ? User.fromPrimitives({
          ...result,
          emailVerified: result.password
            ? result.emailVerification.verified
            : true,
        })
      : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.prismaService.user.findMany({
      include: { emailVerification: { select: { verified: true } } },
    });
    return result.map((user) => {
      return User.fromPrimitives({
        ...user,
        emailVerified: user.password ? user.emailVerification.verified : true,
      });
    });
  }

  async updateUser(id: UserId, updatedUser: User): Promise<User> {
    try {
      const userPrimitives = updatedUser.toPrimitives();
      await this.prismaService.user.update({
        where: { id: id.toPrimitive() },
        data: {
          id: userPrimitives.id,
          firstName: userPrimitives.firstName,
          familyName: userPrimitives.familyName,
          email: userPrimitives.email,
          password: userPrimitives.password,
          role: userPrimitives.role.toString(),
          imageUrl: userPrimitives.imageUrl,
        },
      });
      return updatedUser;
    } catch {
      return undefined;
    }
  }

  async deleteUser(id: UserId): Promise<boolean> {
    try {
      await this.prismaService.user.delete({ where: { id: id.toPrimitive() } });
      return true;
    } catch {
      return false;
    }
  }
}

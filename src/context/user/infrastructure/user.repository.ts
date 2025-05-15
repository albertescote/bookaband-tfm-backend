import { Injectable } from "@nestjs/common";
import User from "../../shared/domain/user";
import UserId from "../../shared/domain/userId";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import { UserProfileDetails } from "../domain/userProfileDetails";

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
          joinedDate: userPrimitives.joinedDate,
          role: userPrimitives.role.toString(),
          imageUrl: userPrimitives.imageUrl,
          bio: userPrimitives.bio,
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
          joinedDate: result.joinedDate.toISOString(),
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
          joinedDate: result.joinedDate.toISOString(),
        })
      : undefined;
  }

  async getUserProfileDetails(
    id: UserId,
  ): Promise<UserProfileDetails | undefined> {
    const result = await this.prismaService.user.findUnique({
      where: { id: id.toPrimitive() },
      include: {
        emailVerification: { select: { verified: true } },
        billingAddress: true,
        paymentMethods: true,
        bookings: true,
        chats: true,
      },
    });

    if (!result) return undefined;

    const billingAddress = result.billingAddress
      ? {
          id: result.billingAddress.id,
          country: result.billingAddress.country,
          city: result.billingAddress.city,
          postalCode: result.billingAddress.postalCode,
          addressLine1: result.billingAddress.addressLine1,
          addressLine2: result.billingAddress.addressLine2 ?? undefined,
        }
      : undefined;

    const paymentMethods = result.paymentMethods.map((pm) => ({
      id: pm.id,
      type: pm.type,
      lastFour: pm.lastFour,
      isDefault: pm.isDefault,
      createdAt: pm.createdAt,
      brand: pm.brand ?? undefined,
      alias: pm.alias ?? undefined,
    }));

    const activitySummary = {
      musiciansContacted: result.chats.length,
      eventsOrganized: result.bookings.length,
    };

    return {
      id: result.id,
      firstName: result.firstName,
      familyName: result.familyName,
      email: result.email,
      role: result.role,
      joinedDate: result.joinedDate,
      billingAddress,
      paymentMethods,
      activitySummary,
      imageUrl: result.imageUrl ?? undefined,
      bio: result.bio ?? undefined,
    };
  }

  async getAllUsers(): Promise<User[]> {
    const result = await this.prismaService.user.findMany({
      include: { emailVerification: { select: { verified: true } } },
    });
    return result.map((user) => {
      return User.fromPrimitives({
        ...user,
        emailVerified: user.password ? user.emailVerification.verified : true,
        joinedDate: user.joinedDate.toISOString(),
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
          joinedDate: userPrimitives.joinedDate,
          role: userPrimitives.role.toString(),
          imageUrl: userPrimitives.imageUrl,
          bio: userPrimitives.bio,
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

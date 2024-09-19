import { Injectable } from "@nestjs/common";
import User, { UserPrimitives } from "../../shared/domain/user";
import UserId from "../../shared/domain/userId";
import PrismaService from "../../shared/infrastructure/db/prisma.service";

@Injectable()
export class UserRepository {
  constructor(private prismaService: PrismaService) {}

  async addUser(user: User): Promise<User> {
    const userPrimitives = user.toPrimitives();
    try {
      await this.prismaService.user.create({ data: userPrimitives });
      return user;
    } catch {
      return undefined;
    }
  }

  async getUserById(id: UserId): Promise<User> {
    const user: UserPrimitives = await this.prismaService.user.findFirst({
      where: { id: id.toPrimitive() },
    });
    return user ? User.fromPrimitives(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user: UserPrimitives = await this.prismaService.user.findFirst({
      where: { email: email },
    });
    return user ? User.fromPrimitives(user) : undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const users: UserPrimitives[] = await this.prismaService.user.findMany();
    return users.map((user) => {
      return User.fromPrimitives(user);
    });
  }

  async updateUser(id: UserId, updatedUser: User): Promise<User> {
    try {
      await this.prismaService.user.update({
        where: { id: id.toPrimitive() },
        data: updatedUser.toPrimitives(),
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

import { Module } from "@nestjs/common";
import { UserRepository } from "./infrastructure/user.repository";
import { PasswordService } from "../shared/utils/password.service";
import { UserService } from "./service/user.service";
import PrismaService from "../shared/infrastructure/db/prisma.service";

@Module({
  providers: [UserService, UserRepository, PasswordService, PrismaService],
  exports: [UserService],
})
export class UserModule {}

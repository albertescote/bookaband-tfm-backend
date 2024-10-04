import { Module } from "@nestjs/common";
import { UserRepository } from "./infrastructure/user.repository";
import { PasswordService } from "../shared/utils/password.service";
import { UserService } from "./service/user.service";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { UserQueryHandler } from "./service/user.queryHandler";

@Module({
  providers: [
    UserService,
    UserRepository,
    PasswordService,
    PrismaService,
    UserQueryHandler,
  ],
  exports: [UserService, UserQueryHandler],
})
export class UserModule {}

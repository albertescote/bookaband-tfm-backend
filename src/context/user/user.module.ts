import { Module } from "@nestjs/common";
import { UserRepository } from "./infrastructure/user.repository";
import { PasswordService } from "../shared/infrastructure/password.service";
import { UserService } from "./service/user.service";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { UserQueryHandler } from "./service/user.queryHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { CreateUserFromGoogleCommandHandler } from "./service/createUserFromGoogle.commandHandler";

@Module({
  imports: [CqrsModule],
  providers: [
    UserService,
    UserRepository,
    PasswordService,
    PrismaService,
    UserQueryHandler,
    ModuleConnectors,
    CreateUserFromGoogleCommandHandler,
  ],
  exports: [UserService, UserQueryHandler],
})
export class UserModule {}

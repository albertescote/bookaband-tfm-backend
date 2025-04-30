import { Module } from "@nestjs/common";
import { UserRepository } from "./infrastructure/user.repository";
import { PasswordService } from "../shared/utils/password.service";
import { UserService } from "./service/user.service";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { UserQueryHandler } from "./service/user.queryHandler";
import { CqrsModule } from "@nestjs/cqrs";
import { JoseWrapper } from "../shared/infrastructure/joseWrapper";
import { AUTHORIZE_SERVICE_PRIVATE_KEY } from "../auth/config";
import { VerifyUserEmailCommandHandler } from "./service/verifyUserEmail.commandHandler";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";

@Module({
  imports: [CqrsModule],
  providers: [
    UserService,
    UserRepository,
    PasswordService,
    PrismaService,
    UserQueryHandler,
    VerifyUserEmailCommandHandler,
    ModuleConnectors,
    {
      provide: "JoseWrapperInitialized",
      useFactory: () => {
        return new JoseWrapper(AUTHORIZE_SERVICE_PRIVATE_KEY);
      },
    },
  ],
  exports: [UserService, UserQueryHandler, VerifyUserEmailCommandHandler],
})
export class UserModule {}

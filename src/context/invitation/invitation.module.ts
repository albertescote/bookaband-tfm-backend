import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { InvitationService } from "./service/invitation.service";
import { InvitationRepository } from "./infrastructure/invitation.repository";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
  imports: [CqrsModule],
  providers: [
    InvitationService,
    InvitationRepository,
    PrismaService,
    ModuleConnectors,
  ],
  exports: [InvitationService],
})
export class InvitationModule {}

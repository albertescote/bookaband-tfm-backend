import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { ModuleConnectors } from "../shared/infrastructure/moduleConnectors";
import { InvoiceService } from "./service/invoice.service";
import { InvoiceRepository } from "./infrastructure/invoice.repository";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
  imports: [CqrsModule],
  providers: [
    ModuleConnectors,
    InvoiceService,
    InvoiceRepository,
    PrismaService,
  ],
  exports: [InvoiceService],
})
export class InvoiceModule {}

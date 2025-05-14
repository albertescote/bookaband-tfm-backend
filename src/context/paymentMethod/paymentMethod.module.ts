import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { PaymentMethodService } from "./service/paymentMethod.service";
import { PaymentMethodRepository } from "./infrastructure/paymentMethod.repository";

@Module({
  imports: [],
  providers: [PaymentMethodService, PaymentMethodRepository, PrismaService],
  exports: [PaymentMethodService],
})
export class PaymentMethodModule {}

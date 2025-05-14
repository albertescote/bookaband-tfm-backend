import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { BillingAddressService } from "./service/billingAddress.service";
import { BillingAddressRepository } from "./infrastructure/billingAddress.repository";

@Module({
  imports: [],
  providers: [BillingAddressService, BillingAddressRepository, PrismaService],
  exports: [BillingAddressService],
})
export class BillingAddressModule {}

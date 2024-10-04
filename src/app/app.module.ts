import { Module } from "@nestjs/common";
import { OfferController } from "./api/offer/offer.controller";
import { OfferModule } from "../context/offer/offer.module";
import { HealthcheckController } from "./api/healthcheck/healthcheck.controller";
import { UserModule } from "../context/user/user.module";
import { UserController } from "./api/user/user.controller";
import { AuthController } from "./api/auth/auth.controller";
import { AuthModule } from "../context/auth/auth.module";
import { BandModule } from "../context/band/band.module";

@Module({
  imports: [OfferModule, UserModule, AuthModule, BandModule],
  controllers: [
    HealthcheckController,
    OfferController,
    UserController,
    AuthController,
  ],
})
export class AppModule {}

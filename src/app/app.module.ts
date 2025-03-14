import { Module } from "@nestjs/common";
import { OfferController } from "./api/offer/offer.controller";
import { OfferModule } from "../context/offer/offer.module";
import { HealthcheckController } from "./api/healthcheck/healthcheck.controller";
import { UserModule } from "../context/user/user.module";
import { UserController } from "./api/user/user.controller";
import { AuthController } from "./api/auth/auth.controller";
import { AuthModule } from "../context/auth/auth.module";
import { BandModule } from "../context/band/band.module";
import { BandController } from "./api/band/band.controller";
import { OffersViewController } from "./api/offersView/offersView.controller";
import { ChatModule } from "../context/chat/chat.module";
import { ChatController } from "./api/chat/chat.controller";

@Module({
  imports: [OfferModule, UserModule, AuthModule, BandModule, ChatModule],
  controllers: [
    HealthcheckController,
    OfferController,
    BandController,
    OffersViewController,
    UserController,
    AuthController,
    ChatController,
  ],
})
export class AppModule {}

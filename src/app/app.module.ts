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
import { ChatModule } from "../context/chat/chat.module";
import { ChatController } from "./api/chat/chat.controller";
import { InvitationModule } from "../context/invitation/invitation.module";
import { InvitationController } from "./api/invitation/invitation.controller";
import { BookingController } from "./api/booking/booking.controller";
import { BookingModule } from "../context/booking/booking.module";

@Module({
  imports: [
    OfferModule,
    UserModule,
    AuthModule,
    BandModule,
    ChatModule,
    InvitationModule,
    BookingModule,
  ],
  controllers: [
    HealthcheckController,
    OfferController,
    BandController,
    UserController,
    AuthController,
    ChatController,
    InvitationController,
    BookingController,
  ],
})
export class AppModule {}

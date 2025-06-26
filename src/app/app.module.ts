import { Module } from "@nestjs/common";
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
import { EmailModule } from "../context/email/email.module";
import { EmailController } from "./api/email/email.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { EventTypeController } from "./api/eventType/eventType.controller";
import { EventTypeModule } from "../context/eventType/eventType.module";
import { BillingAddressModule } from "../context/billingAddress/billingAddress.module";
import { BillingAddressController } from "./api/billingAddress/billingAddress.controller";
import { PaymentMethodModule } from "../context/paymentMethod/paymentMethod.module";
import { PaymentMethodController } from "./api/paymentMethod/paymentMethod.controller";
import { ContractModule } from "../context/contract/contract.module";
import { InvoiceModule } from "../context/invoice/invoice.module";
import { ContractController } from "./api/contract/contract.controller";
import { InvoiceController } from "./api/invoice/invoice.controller";
import { MusicalStyleModule } from "../context/musicalStyle/musicalStyle.module";
import { MusicalStyleController } from "./api/musicalStyle/musicalStyle.controller";
import { FileUploadModule } from "../context/fileUpload/fileUpload.module";
import { FileUploadController } from "./api/fileUpload/fileUpload.controller";
import { NotificationModule } from "../context/notification/notification.module";
import { NotificationController } from "./api/notification/notification.controller";
import { ArtistReviewController } from "./api/artistReview/artistReview.controller";
import { ArtistReviewModule } from "../context/artistReview/artistReview.module";

@Module({
  imports: [
    CqrsModule,
    UserModule,
    AuthModule,
    BandModule,
    ChatModule,
    InvitationModule,
    BookingModule,
    EmailModule,
    EventTypeModule,
    BillingAddressModule,
    PaymentMethodModule,
    ContractModule,
    InvoiceModule,
    MusicalStyleModule,
    FileUploadModule,
    NotificationModule,
    ArtistReviewModule,
  ],
  controllers: [
    HealthcheckController,
    BandController,
    UserController,
    AuthController,
    ChatController,
    InvitationController,
    BookingController,
    EmailController,
    EventTypeController,
    BillingAddressController,
    PaymentMethodController,
    ContractController,
    InvoiceController,
    MusicalStyleController,
    FileUploadController,
    NotificationController,
    ArtistReviewController,
  ],
})
export class AppModule {}

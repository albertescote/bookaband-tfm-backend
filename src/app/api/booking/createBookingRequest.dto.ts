import { BookingStatus } from "../../../context/booking/domain/bookingStatus";
import { IsDate, IsEnum, IsNotEmpty, IsUUID } from "class-validator";

export class CreateBookingRequestDto {
  @IsNotEmpty()
  @IsUUID()
  offerId: string;

  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsNotEmpty()
  @IsDate()
  date: Date;
}

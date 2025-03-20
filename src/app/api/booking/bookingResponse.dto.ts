import { BookingStatus } from "../../../context/booking/domain/bookingStatus";

export interface BookingResponseDto {
  id: string;
  offerId: string;
  userId: string;
  status: BookingStatus;
  date: Date;
  createdAt: Date;
}

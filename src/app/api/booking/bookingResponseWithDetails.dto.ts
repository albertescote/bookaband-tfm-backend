import { BookingStatus } from "../../../context/booking/domain/bookingStatus";

export interface BookingResponseWithDetailsDto {
  id: string;
  offerId: string;
  userId: string;
  status: BookingStatus;
  date: Date;
  userName: string;
  bandName: string;
  userImageUrl?: string;
  bandImageUrl?: string;
}

import { BookingStatus } from "../../../context/booking/domain/bookingStatus";

export interface BookingResponseDto {
  id: string;
  bandId: string;
  userId: string;
  status: BookingStatus;
  date: Date;
  name: string;
  country: string;
  city: string;
  venue: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  eventTypeId?: string;
  isPublic?: boolean;
}

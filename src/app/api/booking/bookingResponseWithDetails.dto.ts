import { BookingStatus } from "../../../context/shared/domain/bookingStatus";

export interface BookingResponseWithDetailsDto {
  id: string;
  bandId: string;
  userId: string;
  status: BookingStatus;
  initDate: Date;
  endDate: Date;
  cost: number;
  name: string;
  userName: string;
  bandName: string;
  userImageUrl?: string;
  bandImageUrl?: string;
  country: string;
  city: string;
  venue: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
  eventTypeId?: string;
  isPublic?: boolean;
}

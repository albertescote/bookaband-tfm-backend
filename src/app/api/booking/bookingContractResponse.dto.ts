export interface BookingContractResponseDto {
  id: string;
  bookingId: string;
  status: string;
  fileUrl: string;
  userSigned: boolean;
  bandSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
  eventName?: string;
  bandName?: string;
  userName?: string;
  eventDate?: Date;
}

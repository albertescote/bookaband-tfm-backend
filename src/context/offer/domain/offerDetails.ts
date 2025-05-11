export interface OfferDetails {
  id: string;
  bandId: string;
  bandName: string;
  genre: string;
  bookingDates: string[];
  description: string;
  price?: number;
  imageUrl?: string;
}

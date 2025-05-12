import { BandSize } from "../../../context/offer/domain/bandSize";

export interface OfferDetailsResponseDto {
  id: string;
  bandId: string;
  bandName: string;
  genre: string;
  bookingDates: string[];
  description: string;
  location: string;
  featured: boolean;
  bandSize: BandSize;
  equipment: string[];
  eventTypeIds: string[];
  reviewCount: number;
  price?: number;
  imageUrl?: string;
  rating?: number;
}

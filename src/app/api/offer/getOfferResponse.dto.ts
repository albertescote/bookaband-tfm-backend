import { MusicGenre } from "../../../context/offer/domain/musicGenre";

export interface GetOfferResponseDto {
  id: string;
  ownerId: string;
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

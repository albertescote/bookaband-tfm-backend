import { MusicGenre } from "../../../context/offer/domain/musicGenre";

export interface UpdateOfferResponseDto {
  id: string;
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

import { MusicGenre } from "../../../context/offer/domain/musicGenre";

export interface GetAllOfferResponseDto {
  id: string;
  price: number;
  bandName: string;
  genre: MusicGenre;
  description?: string;
  imageUrl?: string;
}

import { MusicGenre } from "../../../context/band/domain/musicGenre";

export interface BandWithDetailsResponseDto {
  id: string;
  name: string;
  genre: MusicGenre;
  members: {
    id: string;
    userName: string;
    imageUrl?: string;
  }[];
  imageUrl?: string;
}

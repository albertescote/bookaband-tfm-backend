import { MusicGenre } from "../../../context/band/domain/musicGenre";
import { BandRole } from "../../../context/band/domain/bandRole";

export interface BandWithDetailsResponseDto {
  id: string;
  name: string;
  genre: MusicGenre;
  members: {
    id: string;
    userName: string;
    imageUrl?: string;
    role: BandRole;
  }[];
  imageUrl?: string;
}

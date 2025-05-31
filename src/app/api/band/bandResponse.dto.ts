import { MusicGenre } from "../../../context/band/domain/musicGenre";
import { BandRole } from "../../../context/band/domain/bandRole";

export interface BandResponseDto {
  id: string;
  name: string;
  genre: MusicGenre;
  members: { id: string; role: BandRole }[];
  followers: number;
  following: number;
  reviewCount: number;
  rating?: number;
  imageUrl?: string;
  bio?: string;
}

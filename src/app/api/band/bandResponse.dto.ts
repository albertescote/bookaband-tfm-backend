import { MusicGenre } from "../../../context/band/domain/musicGenre";

export interface BandResponseDto {
  id: string;
  name: string;
  genre: MusicGenre;
  membersId: string[];
  followers: number;
  following: number;
  reviewCount: number;
  rating?: number;
  imageUrl?: string;
  bio?: string;
}

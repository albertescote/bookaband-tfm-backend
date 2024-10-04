import { MusicGenre } from "../../../context/band/domain/musicGenre";

export interface BandResponseDto {
  id: string;
  name: string;
  genre: MusicGenre;
  membersId: string[];
  imageUrl?: string;
}

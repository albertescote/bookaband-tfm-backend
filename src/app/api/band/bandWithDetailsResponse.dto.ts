import { BandRole } from "../../../context/band/domain/bandRole";

export interface BandWithDetailsResponseDto {
  id: string;
  name: string;
  musicalStyleIds: string[];
  members: {
    id: string;
    userName: string;
    imageUrl?: string;
    role: BandRole;
  }[];
  imageUrl?: string;
}

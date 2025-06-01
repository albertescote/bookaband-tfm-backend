import { BandRole } from "../../../context/band/domain/bandRole";

export interface BandResponseDto {
  id: string;
  name: string;
  members: { id: string; role: BandRole }[];
  musicalStyleIds: string[];
  imageUrl?: string;
  bio?: string;
}

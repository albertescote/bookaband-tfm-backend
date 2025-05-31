import { BandRole } from "../../../context/band/domain/bandRole";

export interface BandResponseDto {
  id: string;
  name: string;
  musicalStyleIds: string[];
  members: { id: string; role: BandRole }[];
  followers: number;
  following: number;
  reviewCount: number;
  rating?: number;
  imageUrl?: string;
  bio?: string;
  price: number;
  description: string;
  location: string;
  bandSize: string;
  eventTypeIds: string[];
  featured: boolean;
  visible: boolean;
}

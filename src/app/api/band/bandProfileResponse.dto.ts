import {
  HospitalityRider,
  PerformanceArea,
  TechnicalRider,
  WeeklyAvailability,
} from "../../../context/band/domain/band";
import { BandSize } from "../../../context/band/domain/bandSize";
import { BandRole } from "../../../context/band/domain/bandRole";

interface ArtistReview {
  id: string;
  rating: number;
  comment: string;
  reviewer: {
    name: string;
    imageUrl?: string;
  };
  date: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  eventTypeId: string;
  city?: string;
  country?: string;
  venue?: string;
  isPublic?: boolean;
}

interface Media {
  id: string;
  url: string;
  type: string;
}

interface SocialLinks {
  id: string;
  platform: string;
  url: string;
}

export interface BandProfileResponseDto {
  id: string;
  name: string;
  musicalStyleIds: string[];
  bookingDates: string[];
  location: string;
  featured: boolean;
  bandSize: BandSize;
  eventTypeIds: string[];
  reviewCount: number;
  createdDate: Date;
  weeklyAvailability: WeeklyAvailability;
  hospitalityRider: HospitalityRider;
  technicalRider: TechnicalRider;
  performanceArea: PerformanceArea;
  media: Media[];
  socialLinks: SocialLinks[];
  followers: number;
  following: number;
  reviews: ArtistReview[];
  events: Event[];
  members?: { id: string; role: BandRole; name: string; imageUrl?: string }[];
  price?: number;
  imageUrl?: string;
  rating?: number;
  bio?: string;
}

import {
  HospitalityRider,
  PerformanceArea,
  TechnicalRider,
  WeeklyAvailability,
} from "../../../context/band/domain/band";
import { BandSize } from "../../../context/band/domain/bandSize";

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
  bandId: string;
  bandName: string;
  musicalStyleIds: string[];
  membersId: string[];
  bookingDates: string[];
  location: string;
  featured: boolean;
  bandSize: BandSize;
  eventTypeIds: string[];
  reviewCount: number;
  createdDate: Date;
  price?: number;
  imageUrl?: string;
  rating?: number;
  bio?: string;
  followers?: number;
  following?: number;
  weeklyAvailability?: WeeklyAvailability;
  hospitalityRider?: HospitalityRider;
  technicalRider?: TechnicalRider;
  performanceArea?: PerformanceArea;
  reviews?: ArtistReview[];
  media?: Media[];
  events?: Event[];
  socialLinks?: SocialLinks[];
}

import { WeeklyAvailability } from "./band";
import { BandSize } from "./bandSize";

export interface ArtistReview {
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
  platform: string;
  url: string;
}

interface HospitalityRider {
  accommodation: string;
  catering: string;
  beverages: string;
  specialRequirements: string;
}

interface TechnicalRider {
  soundSystem: string;
  microphones: string;
  backline: string;
  lighting: string;
  otherRequirements: string;
}

interface PerformanceArea {
  regions: string[];
  travelPreferences: string[];
  restrictions: string[];
}

export interface BandProfile {
  id: string;
  bandId: string;
  bandName: string;
  musicalStyleIds: string[];
  membersId: string[];
  bookingDates: string[];
  location: string;
  featured: boolean;
  bandSize: BandSize;
  equipment: string[];
  eventTypeIds: string[];
  reviewCount: number;
  createdDate: Date;
  price?: number;
  imageUrl?: string;
  rating?: number;
  bio?: string;
  followers?: number;
  following?: number;
  weeklyAvailability: WeeklyAvailability;
  hospitalityRider?: HospitalityRider;
  technicalRider?: TechnicalRider;
  performanceArea?: PerformanceArea;
  reviews?: ArtistReview[];
  media?: Media[];
  events?: Event[];
  socialLinks?: SocialLinks[];
}

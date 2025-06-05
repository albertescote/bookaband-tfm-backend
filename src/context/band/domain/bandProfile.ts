import { WeeklyAvailability } from "./band";
import { BandSize } from "./bandSize";
import { BandRole } from "./bandRole";
import { BookingStatus } from "../../booking/domain/bookingStatus";

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
  status?: BookingStatus;
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

interface HospitalityRider {
  accommodation: string;
  catering: string;
  beverages: string;
  specialRequirements?: string;
}

interface TechnicalRider {
  soundSystem: string;
  microphones: string;
  backline: string;
  lighting: string;
  otherRequirements?: string;
}

interface PerformanceArea {
  regions: string[];
  travelPreferences: string;
  restrictions?: string;
}

export interface BandProfile {
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
  followers: number;
  following: number;
  reviews: ArtistReview[];
  media: Media[];
  events: Event[];
  socialLinks: SocialLinks[];
  members?: { id: string; role: BandRole; name: string; imageUrl?: string }[];
  price?: number;
  imageUrl?: string;
  rating?: number;
  bio?: string;
}

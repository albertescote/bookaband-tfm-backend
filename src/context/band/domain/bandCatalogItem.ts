import { BandSize } from "./bandSize";
import {
  HospitalityRider,
  PerformanceArea,
  TechnicalRider,
  WeeklyAvailability,
} from "./band";

export interface BandCatalogItem {
  id: string;
  name: string;
  musicalStyleIds: string[];
  bookingDates: string[];
  location: string;
  featured: boolean;
  bandSize: BandSize;
  eventTypeIds: string[];
  reviewCount: number;
  weeklyAvailability: WeeklyAvailability;
  hospitalityRider?: HospitalityRider;
  technicalRider?: TechnicalRider;
  performanceArea: PerformanceArea;
  bio?: string;
  price?: number;
  imageUrl?: string;
  rating?: number;
}

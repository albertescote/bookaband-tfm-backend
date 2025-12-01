import { Injectable } from "@nestjs/common";
import axios from "axios";
import { GoogleMapsApiException } from "../exceptions/googleMapsApiException";
import { FailedToFetchGasPriceException } from "../exceptions/failedToFetchGasPriceException";

interface OSRMResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
  }>;
}

interface NominatimSearchResponse {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable()
export class GasPriceCalculator {
  private readonly osrmBaseUrl = "http://router.project-osrm.org";
  private readonly nominatimBaseUrl = "https://nominatim.openstreetmap.org";
  private readonly userAgent = "Bookaband/1.0";

  async calculateGasCost(options: {
    artistLocation: string;
    bookingLocation: string;
    useDynamicPricing: boolean;
    fallbackPricePerLiter: number;
    fuelConsumption: number;
  }): Promise<{
    distance: number;
    pricePerLiter: number;
    gasCost: number;
  }> {
    const {
      artistLocation,
      bookingLocation,
      useDynamicPricing,
      fallbackPricePerLiter,
      fuelConsumption,
    } = options;

    const distance = await this.fetchDistance(artistLocation, bookingLocation);
    const totalDistance = distance * 2;

    const pricePerLiter = useDynamicPricing
      ? await this.fetchGasPrice()
      : fallbackPricePerLiter;

    const gasCost = parseFloat(
      ((totalDistance * fuelConsumption * pricePerLiter) / 100).toFixed(2),
    );

    return {
      distance: parseFloat(distance.toFixed(2)),
      pricePerLiter: parseFloat(pricePerLiter.toFixed(3)),
      gasCost,
    };
  }

  private async fetchDistance(
    origin: string,
    destination: string,
  ): Promise<number> {
    try {
      // First, geocode the origin and destination using Nominatim
      await this.respectRateLimit();
      const originCoords = await this.geocodeLocation(origin);

      await this.respectRateLimit();
      const destinationCoords = await this.geocodeLocation(destination);

      if (!originCoords || !destinationCoords) {
        throw new GoogleMapsApiException();
      }

      // Then use OSRM to calculate the driving distance
      const url = `${this.osrmBaseUrl}/route/v1/driving/${originCoords.lon},${originCoords.lat};${destinationCoords.lon},${destinationCoords.lat}?overview=false`;

      const response = await axios.get<OSRMResponse>(url);
      const data = response.data;

      if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
        throw new GoogleMapsApiException();
      }

      const distanceInMeters = data.routes[0].distance;
      return distanceInMeters / 1000;
    } catch (error) {
      console.error("Error fetching distance from OSRM:", error);
      throw new GoogleMapsApiException();
    }
  }

  private async geocodeLocation(
    locationName: string,
  ): Promise<{ lat: string; lon: string } | null> {
    try {
      const response = await axios.get<NominatimSearchResponse[]>(
        `${this.nominatimBaseUrl}/search`,
        {
          params: {
            q: locationName,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": this.userAgent,
          },
        },
      );

      if (response.data.length === 0) {
        return null;
      }

      return {
        lat: response.data[0].lat,
        lon: response.data[0].lon,
      };
    } catch (error) {
      console.error("Error geocoding location:", error);
      return null;
    }
  }

  private async fetchGasPrice(): Promise<number> {
    const today = new Date().toISOString().split("T")[0];
    const url = `https://api.precioil.es/precioMedioDiario?idFuelType=10&fechaInicio=${today}&fechaFin=${today}`;

    const response = await axios.get(url);
    const data = response.data;

    if (!data?.[0]?.PrecioMedio) {
      throw new FailedToFetchGasPriceException();
    }

    return parseFloat(data[0].PrecioMedio);
  }

  // Respect Nominatim's usage policy: max 1 request per second
  private async respectRateLimit(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

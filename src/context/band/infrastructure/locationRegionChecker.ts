import axios from "axios";
import { Injectable } from "@nestjs/common";

interface NominatimResponse {
  place_id: number;
  osm_type: string;
  osm_id: number;
  display_name: string;
  address?: {
    country?: string;
    state?: string;
    county?: string;
    province?: string;
    region?: string;
  };
  type?: string;
}

@Injectable()
export class LocationRegionChecker {
  private readonly nominatimBaseUrl = "https://nominatim.openstreetmap.org";
  private readonly userAgent = "Bookaband/1.0";

  public async isLocationInRegions(
    locationName: string,
    regionPlaceIds: string[],
  ): Promise<boolean> {
    const locationPlaceId = await this.getPlaceIdFromName(locationName);
    if (!locationPlaceId) return false;

    const componentNames =
      await this.getRelevantComponentNames(locationPlaceId);
    if (!componentNames.length) return false;

    const componentPlaceIds = await Promise.all(
      componentNames.map(({ name, type }) =>
        this.getPlaceIdFromName(name, type),
      ),
    );

    return componentPlaceIds.some(
      (placeId) => placeId && regionPlaceIds.includes(placeId),
    );
  }

  private async getPlaceIdFromName(
    locationName: string,
    expectedType?: string,
  ): Promise<string | null> {
    try {
      await this.respectRateLimit();

      const searchQueries = [locationName];

      if (expectedType === "county") {
        searchQueries.push(`${locationName} province`);
      }

      for (const query of searchQueries) {
        const response = await axios.get<NominatimResponse[]>(
          `${this.nominatimBaseUrl}/search`,
          {
            params: {
              q: query,
              format: "json",
              addressdetails: 1,
              limit: 5,
            },
            headers: {
              "User-Agent": this.userAgent,
            },
          },
        );

        const result = response.data.find((r: NominatimResponse) => {
          if (!expectedType) return true;

          // Map Google types to OSM types
          const typeMapping: Record<string, string[]> = {
            state: ["state", "province", "region"],
            county: ["county", "province"],
            country: ["country"],
          };

          const osmTypes = typeMapping[expectedType] || [expectedType];
          return osmTypes.includes(r.type || "");
        });

        if (result) {
          // OSM place_id format: osm_type + osm_id
          return `${result.osm_type}${result.osm_id}`;
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching place ID from Nominatim:", error);
      return null;
    }
  }

  private async getRelevantComponentNames(
    placeId: string,
  ): Promise<{ name: string; type: string }[]> {
    try {
      await this.respectRateLimit();

      // Extract osm_type and osm_id from the combined place_id
      const osmType = placeId.charAt(0); // 'N', 'W', or 'R'
      const osmId = placeId.slice(1);

      const response = await axios.get<NominatimResponse>(
        `${this.nominatimBaseUrl}/lookup`,
        {
          params: {
            osm_ids: `${osmType}${osmId}`,
            format: "json",
            addressdetails: 1,
          },
          headers: {
            "User-Agent": this.userAgent,
          },
        },
      );

      const result = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      if (!result?.address) return [];

      const components: { name: string; type: string }[] = [];

      // Map OSM address components to our types
      if (result.address.state) {
        components.push({ name: result.address.state, type: "state" });
      }

      if (result.address.county || result.address.province) {
        components.push({
          name: result.address.county || result.address.province || "",
          type: "county",
        });
      }

      if (result.address.country) {
        components.push({ name: result.address.country, type: "country" });
      }

      return components;
    } catch (error) {
      console.error("Error fetching address components from Nominatim:", error);
      return [];
    }
  }

  // Respect Nominatim's usage policy: max 1 request per second
  private async respectRateLimit(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

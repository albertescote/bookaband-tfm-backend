import axios from "axios";
import { Inject, Injectable } from "@nestjs/common";
import { MissingGoogleMapsApiKeyException } from "../exceptions/missingGoogleMapsApiKeyException";

@Injectable()
export class LocationRegionChecker {
  constructor(@Inject("google-maps-api-key") private googleMapsApiKey: string) {
    if (!this.googleMapsApiKey) {
      throw new MissingGoogleMapsApiKeyException();
    }
  }

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
      const searchQueries = [locationName];

      if (expectedType === "administrative_area_level_2") {
        searchQueries.push(`${locationName} province`);
      }

      for (const query of searchQueries) {
        const response = await axios.get(
          "https://maps.googleapis.com/maps/api/geocode/json",
          {
            params: {
              address: query,
              key: this.googleMapsApiKey,
            },
          },
        );

        const result = response.data.results.find((r: any) =>
          expectedType ? r.types.includes(expectedType) : true,
        );

        if (result) {
          return result.place_id;
        }
      }
    } catch (error) {
      console.error("Error fetching place ID:", error);
      return null;
    }
  }

  private async getRelevantComponentNames(
    placeId: string,
  ): Promise<{ name: string; type: string }[]> {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/place/details/json",
        {
          params: {
            place_id: placeId,
            key: this.googleMapsApiKey,
          },
        },
      );

      const components = response.data.result?.address_components || [];

      const relevantComponents = components.filter((comp: any) =>
        comp.types.some((type) =>
          [
            "administrative_area_level_1",
            "administrative_area_level_2",
            "country",
          ].includes(type),
        ),
      );

      return relevantComponents.map((comp: any) => ({
        name: comp.long_name,
        type: comp.types[0],
      }));
    } catch (error) {
      console.error("Error fetching address components:", error);
      return [];
    }
  }
}

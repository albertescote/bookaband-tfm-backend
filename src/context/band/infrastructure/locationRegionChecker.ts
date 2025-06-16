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
      componentNames.map((name) => this.getPlaceIdFromName(name)),
    );

    return componentPlaceIds.some(
      (placeId) => placeId && regionPlaceIds.includes(placeId),
    );
  }

  private async getPlaceIdFromName(
    locationName: string,
  ): Promise<string | null> {
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        {
          params: {
            address: locationName,
            key: this.googleMapsApiKey,
          },
        },
      );

      const result = response.data.results?.[0];
      return result?.place_id || null;
    } catch (error) {
      console.error("Error fetching place ID:", error);
      return null;
    }
  }

  private async getRelevantComponentNames(placeId: string): Promise<string[]> {
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

      return relevantComponents.map((comp: any) => comp.long_name);
    } catch (error) {
      console.error("Error fetching address components:", error);
      return [];
    }
  }
}

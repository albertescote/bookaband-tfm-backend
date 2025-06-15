import { Inject, Injectable } from "@nestjs/common";
import axios from "axios";
import { GoogleMapsApiException } from "../exceptions/googleMapsApiException";
import { FailedToFetchGasPriceException } from "../exceptions/failedToFetchGasPriceException";

@Injectable()
export class GasPriceCalculator {
  constructor(
    @Inject("google-maps-api-key") private googleMapsApiKey: string,
  ) {}

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
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin,
    )}&destinations=${encodeURIComponent(destination)}&key=${this.googleMapsApiKey}`;

    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== "OK") {
      throw new GoogleMapsApiException();
    }

    const distanceInMeters = data.rows[0].elements[0].distance.value;
    return distanceInMeters / 1000; // km
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
}

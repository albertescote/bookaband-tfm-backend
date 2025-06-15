import { Test, TestingModule } from "@nestjs/testing";
import { GasPriceCalculator } from "../../../../src/context/booking/infrastructure/gasPriceCalculator";
import { GoogleMapsApiException } from "../../../../src/context/booking/exceptions/googleMapsApiException";
import { GOOGLE_MAPS_API_KEY } from "../../../../src/config";

describe("GasPriceCalculator Integration Tests", () => {
  let service: GasPriceCalculator;
  const mockGoogleMapsApiKey = GOOGLE_MAPS_API_KEY;

  beforeAll(() => {
    if (!mockGoogleMapsApiKey) {
      throw new Error(
        "GOOGLE_MAPS_API_KEY environment variable is required for integration tests",
      );
    }
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasPriceCalculator,
        {
          provide: "google-maps-api-key",
          useValue: mockGoogleMapsApiKey,
        },
      ],
    }).compile();

    service = module.get<GasPriceCalculator>(GasPriceCalculator);
  });

  describe("calculateGasCost", () => {
    it("should calculate gas cost with dynamic pricing", async () => {
      const result = await service.calculateGasCost({
        artistLocation: "Madrid, Spain",
        bookingLocation: "Barcelona, Spain",
        useDynamicPricing: true,
        fallbackPricePerLiter: 0,
        fuelConsumption: 12.5,
      });

      expect(result).toHaveProperty("distance");
      expect(result).toHaveProperty("pricePerLiter");
      expect(result).toHaveProperty("gasCost");
      expect(result.distance).toBeGreaterThan(0);
      expect(result.pricePerLiter).toBeGreaterThan(0);
      expect(result.gasCost).toBeGreaterThan(0);
    });

    it("should calculate gas cost with static pricing", async () => {
      const staticPricePerLiter = 1.85;
      const result = await service.calculateGasCost({
        artistLocation: "Madrid, Spain",
        bookingLocation: "Barcelona, Spain",
        useDynamicPricing: false,
        fallbackPricePerLiter: staticPricePerLiter,
        fuelConsumption: 12.5,
      });

      expect(result).toHaveProperty("distance");
      expect(result).toHaveProperty("pricePerLiter");
      expect(result).toHaveProperty("gasCost");
      expect(result.distance).toBeGreaterThan(0);
      expect(result.pricePerLiter).toBe(staticPricePerLiter);
      expect(result.gasCost).toBeGreaterThan(0);
    });

    it("should throw GoogleMapsApiException for invalid locations", async () => {
      await expect(
        service.calculateGasCost({
          artistLocation: "Invalid Location 123",
          bookingLocation: "Another Invalid Location 456",
          useDynamicPricing: false,
          fallbackPricePerLiter: 1.85,
          fuelConsumption: 12.5,
        }),
      ).rejects.toThrow(GoogleMapsApiException);
    });

    it("should handle different fuel consumption values", async () => {
      const fuelConsumption = 8.5;
      const result = await service.calculateGasCost({
        artistLocation: "Madrid, Spain",
        bookingLocation: "Barcelona, Spain",
        useDynamicPricing: false,
        fallbackPricePerLiter: 1.85,
        fuelConsumption,
      });

      const roundedDistance = parseFloat(result.distance.toFixed(2));
      const roundedPricePerLiter = parseFloat(result.pricePerLiter.toFixed(3));
      const expectedGasCost = parseFloat(
        (
          (roundedDistance * 2 * fuelConsumption * roundedPricePerLiter) /
          100
        ).toFixed(2),
      );
      expect(result.gasCost).toBe(expectedGasCost);
    });

    it("should handle different distances", async () => {
      const result1 = await service.calculateGasCost({
        artistLocation: "Madrid, Spain",
        bookingLocation: "Barcelona, Spain",
        useDynamicPricing: false,
        fallbackPricePerLiter: 1.85,
        fuelConsumption: 12.5,
      });

      const result2 = await service.calculateGasCost({
        artistLocation: "Madrid, Spain",
        bookingLocation: "Valencia, Spain",
        useDynamicPricing: false,
        fallbackPricePerLiter: 1.85,
        fuelConsumption: 12.5,
      });

      expect(result1.distance).not.toBe(result2.distance);
      expect(result1.gasCost).not.toBe(result2.gasCost);
    });
  });
});

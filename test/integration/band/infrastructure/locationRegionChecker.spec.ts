import { Test, TestingModule } from "@nestjs/testing";
import { LocationRegionChecker } from "../../../../src/context/band/infrastructure/locationRegionChecker";
import { MissingGoogleMapsApiKeyException } from "../../../../src/context/band/exceptions/missingGoogleMapsApiKeyException";
import { GOOGLE_MAPS_API_KEY } from "../../../../src/config";

describe("LocationRegionChecker Integration Tests", () => {
  let checker: LocationRegionChecker;

  describe("constructor", () => {
    it("should throw MissingGoogleMapsApiKeyException when no API key is provided", async () => {
      expect(() => new LocationRegionChecker(undefined)).toThrow(
        MissingGoogleMapsApiKeyException,
      );
    });
  });

  describe("isLocationInRegions", () => {
    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocationRegionChecker,
          {
            provide: "google-maps-api-key",
            useValue: GOOGLE_MAPS_API_KEY,
          },
        ],
      }).compile();

      checker = module.get<LocationRegionChecker>(LocationRegionChecker);
    });
    it("should return false when location name is not found", async () => {
      const result = await checker.isLocationInRegions("NonExistentLocation", [
        "ChIJiTmnWJhE9R4Rr0Wb5KQJ9Y",
      ]);
      expect(result).toBe(false);
    });

    it("should return false when no region place IDs are provided", async () => {
      const result = await checker.isLocationInRegions("Barcelona", []);
      expect(result).toBe(false);
    });

    it("should return true when location is in one of the regions", async () => {
      const result = await checker.isLocationInRegions("Barcelona", [
        "ChIJ5TCOcRaYpBIRCmZHTz37sEQ",
        "ChIJUQ1iQJhE9R4Rr0Wb5KQJ9Y",
      ]);
      expect(result).toBe(true);
    });

    it("should return true when location is in a parent region", async () => {
      const result = await checker.isLocationInRegions("Barcelona", [
        "ChIJiTmnWJhE9R4Rr0Wb5KQJ9Y",
        "ChIJUQ1iQJhE9R4Rr0Wb5KQJ9Y",
        "ChIJ8_UwhdxbpBIRUMijIeD6AAE",
      ]);
      expect(result).toBe(true);
    });

    it("should return false when location is not in any of the regions", async () => {
      const result = await checker.isLocationInRegions("Barcelona", [
        "ChIJUQ1iQJhE9R4Rr0Wb5KQJ9Y",
        "ChIJiTmnWJhE9R4Rr0Wb5KQJ9Y",
      ]);
      expect(result).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should handle API errors gracefully", async () => {
      const invalidApiKey = "invalid-api-key";
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LocationRegionChecker,
          {
            provide: "google-maps-api-key",
            useValue: invalidApiKey,
          },
        ],
      }).compile();

      const checkerWithInvalidKey = module.get<LocationRegionChecker>(
        LocationRegionChecker,
      );

      const result = await checkerWithInvalidKey.isLocationInRegions(
        "Barcelona",
        ["ChIJiTmnWJhE9R4Rr0Wb5KQJ9Y"],
      );
      expect(result).toBe(false);
    });
  });
});

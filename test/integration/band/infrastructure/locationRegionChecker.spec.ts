import { Test, TestingModule } from "@nestjs/testing";
import { LocationRegionChecker } from "../../../../src/context/band/infrastructure/locationRegionChecker";

describe("LocationRegionChecker Integration Tests", () => {
  let checker: LocationRegionChecker;

  describe("isLocationInRegions", () => {
    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [LocationRegionChecker],
      }).compile();

      checker = module.get<LocationRegionChecker>(LocationRegionChecker);
    });

    it("should return false when location name is not found", async () => {
      const result = await checker.isLocationInRegions(
        "NonExistentLocationXYZ123",
        ["R349044"],
      );
      expect(result).toBe(false);
    }, 15000);

    it("should return false when no region place IDs are provided", async () => {
      const result = await checker.isLocationInRegions("Barcelona", []);
      expect(result).toBe(false);
    }, 15000);

    // NOTE: OSM place IDs are different from Google place IDs
    // Format: {osm_type}{osm_id} where osm_type is N (node), W (way), or R (relation)
    // Barcelona city: R347950
    // Catalonia region: R349053
    // Spain: R1311341
    it("should return true when location is in the region and they have the same name", async () => {
      const result = await checker.isLocationInRegions("Barcelona", [
        "R347950", // Barcelona city
        "R349053", // Catalonia
      ]);
      expect(result).toBe(true);
    }, 15000);

    it("should return true when location is in a parent region", async () => {
      const result = await checker.isLocationInRegions("Barcelona", [
        "R349053", // Catalonia
        "R1311341", // Spain
      ]);
      expect(result).toBe(true);
    }, 15000);

    it("should return false when location is not in any of the regions", async () => {
      const result = await checker.isLocationInRegions("Barcelona", [
        "R62149", // Madrid region
        "R448519", // Valencia region
      ]);
      expect(result).toBe(false);
    }, 15000);
  });

  describe("error handling", () => {
    it("should handle API errors gracefully", async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [LocationRegionChecker],
      }).compile();

      const checkerInstance = module.get<LocationRegionChecker>(
        LocationRegionChecker,
      );

      const result = await checkerInstance.isLocationInRegions("Barcelona", [
        "InvalidPlaceId123",
      ]);
      // Should return false when place IDs don't match, not throw an error
      expect(result).toBe(false);
    }, 15000);
  });
});

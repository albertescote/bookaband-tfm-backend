import { Test, TestingModule } from "@nestjs/testing";
import { GetFilteredBandsQueryHandler } from "../../../../src/context/band/service/getFilteredBands.queryHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { GetFilteredBandsQuery } from "../../../../src/context/band/service/getFilteredBands.query";
import { BandCatalogItem } from "../../../../src/context/band/domain/bandCatalogItem";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";

describe("GetFilteredBandsQueryHandler", () => {
  let handler: GetFilteredBandsQueryHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockPage = 1;
  const mockPageSize = 2;

  const mockBandCatalogItems: BandCatalogItem[] = [
    {
      id: BandId.generate().toPrimitive(),
      name: "Test Band 1",
      musicalStyleIds: [
        MusicalStyleId.generate().toPrimitive(),
        MusicalStyleId.generate().toPrimitive(),
      ],
      bookingDates: ["2024-03-20T10:00:00Z"],
      location: "Barcelona",
      featured: true,
      bandSize: BandSize.BAND,
      eventTypeIds: [
        EventTypeId.generate().toPrimitive(),
        EventTypeId.generate().toPrimitive(),
      ],
      reviewCount: 5,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      hospitalityRider: {
        accommodation: "Standard accommodation",
        catering: "Standard catering",
        beverages: "Standard beverages",
        specialRequirements: "No special requirements",
      },
      technicalRider: {
        soundSystem: "Standard sound system",
        microphones: "Standard microphones",
        backline: "Standard backline",
        lighting: "Standard lighting",
        otherRequirements: "No other requirements",
      },
      performanceArea: {
        regions: ["Catalonia", "Valencia", "Balearic Islands"],
        gasPriceCalculation: {
          fuelConsumption: 12.5,
          useDynamicPricing: true,
          pricePerLiter: 1.85,
        },
        otherComments: "No outdoor events during winter",
      },
      bio: "A great test band 1",
      price: 1000,
      imageUrl: "https://example.com/band1.jpg",
      rating: 4.5,
    },
    {
      id: BandId.generate().toPrimitive(),
      name: "Test Band 2",
      musicalStyleIds: [
        MusicalStyleId.generate().toPrimitive(),
        MusicalStyleId.generate().toPrimitive(),
      ],
      bookingDates: ["2024-03-21T10:00:00Z"],
      location: "Madrid",
      featured: false,
      bandSize: BandSize.TRIO,
      eventTypeIds: [
        EventTypeId.generate().toPrimitive(),
        EventTypeId.generate().toPrimitive(),
      ],
      reviewCount: 3,
      weeklyAvailability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      },
      hospitalityRider: {
        accommodation: "Standard accommodation",
        catering: "Standard catering",
        beverages: "Standard beverages",
        specialRequirements: "No special requirements",
      },
      technicalRider: {
        soundSystem: "Standard sound system",
        microphones: "Standard microphones",
        backline: "Standard backline",
        lighting: "Standard lighting",
        otherRequirements: "No other requirements",
      },
      performanceArea: {
        regions: ["Catalonia", "Valencia", "Balearic Islands"],
        gasPriceCalculation: {
          fuelConsumption: 12.5,
          useDynamicPricing: true,
          pricePerLiter: 1.85,
        },
        otherComments: "No outdoor events during winter",
      },
      bio: "A great test band 2",
      price: 2000,
      imageUrl: "https://example.com/band2.jpg",
      rating: 4.0,
    },
  ];

  const mockTotal = 3;

  beforeEach(async () => {
    mockBandRepository = {
      getFilteredBandCatalogItems: jest.fn().mockResolvedValue({
        bandCatalogItems: mockBandCatalogItems,
        total: mockTotal,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFilteredBandsQueryHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<GetFilteredBandsQueryHandler>(
      GetFilteredBandsQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return filtered bands with price when userId is provided", async () => {
      const query = new GetFilteredBandsQuery(
        mockUserId,
        mockPage,
        mockPageSize,
        {
          location: "",
          timeZone: "",
          artistName: "",
          date: "",
        },
      );
      const result = await handler.execute(query);

      expect(result).toEqual({
        bandCatalogItems: mockBandCatalogItems,
        hasMore: true,
        total: mockTotal,
      });
      expect(
        mockBandRepository.getFilteredBandCatalogItems,
      ).toHaveBeenCalledWith(mockPage, mockPageSize, {
        location: "",
        artistName: "",
        date: undefined,
      });
    });

    it("should return filtered bands without price when userId is not provided", async () => {
      const query = new GetFilteredBandsQuery("", mockPage, mockPageSize, {
        location: "",
        timeZone: "",
        artistName: "",
        date: "",
      });
      const result = await handler.execute(query);

      const expectedBands = mockBandCatalogItems.map(
        ({ price, ...rest }) => rest,
      );
      expect(result).toEqual({
        bandCatalogItems: expectedBands,
        hasMore: true,
        total: mockTotal,
      });
      expect(
        mockBandRepository.getFilteredBandCatalogItems,
      ).toHaveBeenCalledWith(mockPage, mockPageSize, {
        location: "",
        artistName: "",
        date: undefined,
      });
    });

    it("should return hasMore as false when all bands are returned", async () => {
      const query = new GetFilteredBandsQuery(mockUserId, 2, 2, {
        location: "",
        timeZone: "",
        artistName: "",
        date: "",
      });
      const result = await handler.execute(query);

      expect(result.hasMore).toBe(false);
      expect(
        mockBandRepository.getFilteredBandCatalogItems,
      ).toHaveBeenCalledWith(2, 2, {
        location: "",
        artistName: "",
        date: undefined,
      });
    });

    it("should handle empty results correctly", async () => {
      mockBandRepository.getFilteredBandCatalogItems.mockResolvedValueOnce({
        bandCatalogItems: [],
        total: 0,
      });

      const query = new GetFilteredBandsQuery(mockUserId, 1, 10, {
        location: "",
        timeZone: "",
        artistName: "",
        date: "",
      });
      const result = await handler.execute(query);

      expect(result).toEqual({
        bandCatalogItems: [],
        hasMore: false,
        total: 0,
      });
      expect(
        mockBandRepository.getFilteredBandCatalogItems,
      ).toHaveBeenCalledWith(1, 10, {
        location: "",
        artistName: "",
        date: undefined,
      });
    });

    it("should pass filters to repository correctly", async () => {
      const filters = {
        location: "Barcelona",
        timeZone: "Europe/Madrid",
        artistName: "Test",
        date: "2024-03-20",
      };
      const query = new GetFilteredBandsQuery(
        mockUserId,
        mockPage,
        mockPageSize,
        filters,
      );
      await handler.execute(query);

      expect(
        mockBandRepository.getFilteredBandCatalogItems,
      ).toHaveBeenCalledWith(mockPage, mockPageSize, {
        artistName: filters.artistName,
        location: filters.location,
        date: {
          dayOfWeek: "wednesday",
          utcEnd: new Date("2024-03-20T22:59:59.000Z"),
          utcStart: new Date("2024-03-19T23:00:00.000Z"),
        },
      });
    });
  });
});

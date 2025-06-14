import { Test, TestingModule } from "@nestjs/testing";
import { GetBandInfoQueryHandler } from "../../../../src/context/band/service/getBandInfo.queryHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { GetBandInfoQuery } from "../../../../src/context/band/service/getBandInfo.query";
import Band, { BandPrimitives } from "../../../../src/context/band/domain/band";
import BandId from "../../../../src/context/shared/domain/bandId";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import UserId from "../../../../src/context/shared/domain/userId";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";

describe("GetBandInfoQueryHandler", () => {
  let handler: GetBandInfoQueryHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();

  const mockBandPrimitives: BandPrimitives = {
    id: mockBandId,
    name: "Test Band",
    members: [{ id: mockUserId, role: BandRole.ADMIN }],
    musicalStyleIds: [
      MusicalStyleId.generate().toPrimitive(),
      MusicalStyleId.generate().toPrimitive(),
    ],
    price: 1000,
    location: "Barcelona",
    bandSize: "4-6",
    eventTypeIds: [
      EventTypeId.generate().toPrimitive(),
      EventTypeId.generate().toPrimitive(),
    ],
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
      accommodation: "Hotel",
      catering: "Full catering",
      beverages: "All drinks included",
      specialRequirements: "Vegetarian options",
    },
    technicalRider: {
      soundSystem: "Full PA system",
      microphones: "4 wireless mics",
      backline: "Basic backline",
      lighting: "Basic stage lighting",
      otherRequirements: "Stage risers",
    },
    performanceArea: {
      regions: ["Catalonia", "Valencia", "Balearic Islands"],
      gasPriceCalculation: {
        fuelConsumption: 12.5,
        useDynamicPricing: false,
        pricePerLiter: 1.85,
      },
      otherComments: "No outdoor events during winter",
    },
    media: [
      { url: "https://example.com/video", type: "video" },
      { url: "https://example.com/image", type: "image" },
    ],
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/testband" },
      { platform: "Facebook", url: "https://facebook.com/testband" },
    ],
    bio: "A great test band",
    imageUrl: "https://example.com/band-image.jpg",
    visible: true,
    reviewCount: 0,
    followers: 0,
    following: 0,
    createdAt: new Date(),
    featured: false,
  };

  const mockBand: Band = {
    toPrimitives: jest.fn().mockReturnValue(mockBandPrimitives),
  } as unknown as Band;

  beforeEach(async () => {
    mockBandRepository = {
      getBandById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBandInfoQueryHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<GetBandInfoQueryHandler>(GetBandInfoQueryHandler);
  });

  describe("execute", () => {
    it("should return band primitives when band is found", async () => {
      mockBandRepository.getBandById.mockResolvedValue(mockBand);

      const query = new GetBandInfoQuery(mockBandId);
      const result = await handler.execute(query);

      expect(result).toEqual(mockBandPrimitives);
      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        expect.any(BandId),
      );
    });

    it("should return undefined when band is not found", async () => {
      mockBandRepository.getBandById.mockResolvedValue(undefined);

      const query = new GetBandInfoQuery(mockBandId);
      const result = await handler.execute(query);

      expect(result).toBeUndefined();
      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        expect.any(BandId),
      );
    });
  });
});

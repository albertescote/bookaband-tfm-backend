import { Test, TestingModule } from "@nestjs/testing";
import {
  FeaturedBand,
  GetFeaturedBandsQueryHandler,
} from "../../../../src/context/band/service/getFeaturedBands.queryHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { GetFeaturedBandsQuery } from "../../../../src/context/band/service/getFeaturedBands.query";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";

describe("GetFeaturedBandsQueryHandler", () => {
  let handler: GetFeaturedBandsQueryHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockPage = 1;
  const mockPageSize = 2;

  const mockFeaturedBands: FeaturedBand[] = [
    {
      id: BandId.generate().toPrimitive(),
      name: "Test Band 1",
      musicalStyleIds: [
        MusicalStyleId.generate().toPrimitive(),
        MusicalStyleId.generate().toPrimitive(),
      ],
      price: 1000,
      imageUrl: "https://example.com/band1.jpg",
      bio: "A great test band 1",
    },
    {
      id: BandId.generate().toPrimitive(),
      name: "Test Band 2",
      musicalStyleIds: [
        MusicalStyleId.generate().toPrimitive(),
        MusicalStyleId.generate().toPrimitive(),
      ],
      price: 2000,
      imageUrl: "https://example.com/band2.jpg",
      bio: "A great test band 2",
    },
  ];

  const mockTotal = 3;

  beforeEach(async () => {
    mockBandRepository = {
      getFeaturedBands: jest.fn().mockResolvedValue({
        featuredBands: mockFeaturedBands,
        total: mockTotal,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetFeaturedBandsQueryHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<GetFeaturedBandsQueryHandler>(
      GetFeaturedBandsQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return featured bands with price when userId is provided", async () => {
      const query = new GetFeaturedBandsQuery(
        mockUserId,
        mockPage,
        mockPageSize,
      );
      const result = await handler.execute(query);

      expect(result).toEqual({
        featuredBands: mockFeaturedBands,
        hasMore: true,
        total: mockTotal,
      });
      expect(mockBandRepository.getFeaturedBands).toHaveBeenCalledWith(
        mockPage,
        mockPageSize,
      );
    });

    it("should return featured bands without price when userId is not provided", async () => {
      const query = new GetFeaturedBandsQuery("", mockPage, mockPageSize);
      const result = await handler.execute(query);

      const expectedBands = mockFeaturedBands.map(({ price, ...rest }) => rest);
      expect(result).toEqual({
        featuredBands: expectedBands,
        hasMore: true,
        total: mockTotal,
      });
      expect(mockBandRepository.getFeaturedBands).toHaveBeenCalledWith(
        mockPage,
        mockPageSize,
      );
    });

    it("should return hasMore as false when all bands are returned", async () => {
      const query = new GetFeaturedBandsQuery(mockUserId, 2, 2);
      const result = await handler.execute(query);

      expect(result.hasMore).toBe(false);
      expect(mockBandRepository.getFeaturedBands).toHaveBeenCalledWith(2, 2);
    });

    it("should handle empty results correctly", async () => {
      mockBandRepository.getFeaturedBands.mockResolvedValueOnce({
        featuredBands: [],
        total: 0,
      });

      const query = new GetFeaturedBandsQuery(mockUserId, 1, 10);
      const result = await handler.execute(query);

      expect(result).toEqual({
        featuredBands: [],
        hasMore: false,
        total: 0,
      });
      expect(mockBandRepository.getFeaturedBands).toHaveBeenCalledWith(1, 10);
    });
  });
});

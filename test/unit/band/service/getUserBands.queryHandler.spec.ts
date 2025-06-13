import { Test, TestingModule } from "@nestjs/testing";
import { GetUserBandsQueryHandler } from "../../../../src/context/band/service/getUserBands.queryHandler";
import {
  BandRepository,
  UserBand,
} from "../../../../src/context/band/infrastructure/band.repository";
import { GetUserBandsQuery } from "../../../../src/context/band/service/getUserBands.query";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";

describe("GetUserBandsQueryHandler", () => {
  let handler: GetUserBandsQueryHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockUserId = UserId.generate().toPrimitive();

  const bandId1 = BandId.generate().toPrimitive();
  const bandId2 = BandId.generate().toPrimitive();

  const mockUserBands: UserBand[] = [
    {
      id: bandId1,
      name: "Test Band 1",
      imageUrl: "https://example.com/band1.jpg",
    },
    {
      id: bandId2,
      name: "Test Band 2",
      imageUrl: "https://example.com/band2.jpg",
    },
  ];

  beforeEach(async () => {
    mockBandRepository = {
      getUserBands: jest.fn().mockResolvedValue(mockUserBands),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserBandsQueryHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUserBandsQueryHandler>(GetUserBandsQueryHandler);
  });

  describe("execute", () => {
    it("should return band IDs for a user", async () => {
      const query = new GetUserBandsQuery(mockUserId);
      const result = await handler.execute(query);

      expect(result).toEqual([bandId1, bandId2]);
      expect(mockBandRepository.getUserBands).toHaveBeenCalled();
    });

    it("should return empty array when user has no bands", async () => {
      mockBandRepository.getUserBands.mockResolvedValueOnce([]);

      const query = new GetUserBandsQuery(mockUserId);
      const result = await handler.execute(query);

      expect(result).toEqual([]);
      expect(mockBandRepository.getUserBands).toHaveBeenCalled();
    });
  });
});

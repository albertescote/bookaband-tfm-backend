import { Test, TestingModule } from "@nestjs/testing";
import { GetBandMembersQueryHandler } from "../../../../src/context/band/service/getBandMembers.queryHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { GetBandMembersQuery } from "../../../../src/context/band/service/getBandMembers.query";
import Band, { BandPrimitives } from "../../../../src/context/band/domain/band";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { BandSize } from "../../../../src/context/band/domain/bandSize";

describe("GetBandMembersQueryHandler", () => {
  let handler: GetBandMembersQueryHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockBandId = BandId.generate().toPrimitive();
  const mockMemberIds = [
    UserId.generate().toPrimitive(),
    UserId.generate().toPrimitive(),
    UserId.generate().toPrimitive(),
  ];

  const mockBandPrimitives: BandPrimitives = {
    id: mockBandId,
    name: "Test Band",
    members: mockMemberIds.map((id) => ({ id, role: BandRole.MEMBER })),
    musicalStyleIds: [],
    eventTypeIds: [],
    reviewCount: 0,
    followers: 0,
    following: 0,
    price: 0,
    location: "",
    bandSize: BandSize.BAND,
    imageUrl: "",
    createdAt: new Date(),
    featured: false,
    visible: true,
    weeklyAvailability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    rating: 0,
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
      regions: ["Catalonia"],
      travelPreferences: "Local",
      restrictions: "None",
    },
    socialLinks: [],
    media: [],
  };

  beforeEach(async () => {
    mockBandRepository = {
      getBandById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBandMembersQueryHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<GetBandMembersQueryHandler>(
      GetBandMembersQueryHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should return member IDs when band is found", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);

      const query = new GetBandMembersQuery(mockBandId);
      const result = await handler.execute(query);

      expect(result).toEqual(mockMemberIds);
      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
    });

    it("should return undefined when band is not found", async () => {
      mockBandRepository.getBandById.mockResolvedValueOnce(undefined);

      const query = new GetBandMembersQuery(mockBandId);
      const result = await handler.execute(query);

      expect(result).toBeUndefined();
      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
    });
  });
});

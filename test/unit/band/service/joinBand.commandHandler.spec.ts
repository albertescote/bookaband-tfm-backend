import { Test, TestingModule } from "@nestjs/testing";
import { JoinBandCommandHandler } from "../../../../src/context/band/service/joinBand.commandHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { JoinBandCommand } from "../../../../src/context/band/service/joinBand.command";
import { BandNotFoundException } from "../../../../src/context/band/exceptions/bandNotFoundException";
import Band, { BandPrimitives } from "../../../../src/context/band/domain/band";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import { BandSize } from "../../../../src/context/band/domain/bandSize";

describe("JoinBandCommandHandler", () => {
  let handler: JoinBandCommandHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();

  const mockBandPrimitives: BandPrimitives = {
    id: mockBandId,
    name: "Test Band",
    members: [],
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
      updateBand: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JoinBandCommandHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<JoinBandCommandHandler>(JoinBandCommandHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should add member to band and update repository", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);
      mockBandRepository.updateBand.mockResolvedValueOnce(mockBand);

      const command = new JoinBandCommand(mockBandId, mockUserId);
      await handler.execute(command);

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).toHaveBeenCalledWith(mockBand);
    });

    it("should throw BandNotFoundException when band does not exist", async () => {
      mockBandRepository.getBandById.mockResolvedValueOnce(undefined);

      const command = new JoinBandCommand(mockBandId, mockUserId);
      await expect(handler.execute(command)).rejects.toThrow(
        new BandNotFoundException(mockBandId),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });
  });
});

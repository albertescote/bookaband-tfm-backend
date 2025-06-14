import { Test, TestingModule } from "@nestjs/testing";
import { LeaveBandCommandHandler } from "../../../../src/context/band/service/leaveBand.commandHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { LeaveBandCommand } from "../../../../src/context/band/service/leaveBand.command";
import { BandNotFoundException } from "../../../../src/context/band/exceptions/bandNotFoundException";
import { UserIsNotMemberOfBandException } from "../../../../src/context/band/exceptions/userIsNotMemberOfBandException";
import { AdminCannotLeaveBandException } from "../../../../src/context/band/exceptions/adminCannotLeaveBandException";
import Band, { BandPrimitives } from "../../../../src/context/band/domain/band";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { BandSize } from "../../../../src/context/band/domain/bandSize";

describe("LeaveBandCommandHandler", () => {
  let handler: LeaveBandCommandHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();
  const mockAdminId = UserId.generate().toPrimitive();

  const mockBandPrimitives: BandPrimitives = {
    id: mockBandId,
    name: "Test Band",
    members: [
      { id: mockUserId, role: BandRole.MEMBER },
      { id: mockAdminId, role: BandRole.ADMIN },
    ],
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
      regions: ["Catalonia", "Valencia", "Balearic Islands"],
      gasPriceCalculation: {
        fuelConsumption: 12.5,
        useDynamicPricing: false,
        pricePerLiter: 1.85,
      },
      otherComments: "No outdoor events during winter",
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
        LeaveBandCommandHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<LeaveBandCommandHandler>(LeaveBandCommandHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should remove member from band and update repository", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);
      mockBandRepository.updateBand.mockResolvedValueOnce(mockBand);

      const command = new LeaveBandCommand(mockBandId, mockUserId);
      await handler.execute(command);

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).toHaveBeenCalledWith(mockBand);
    });

    it("should throw BandNotFoundException when band does not exist", async () => {
      mockBandRepository.getBandById.mockResolvedValueOnce(undefined);

      const command = new LeaveBandCommand(mockBandId, mockUserId);
      await expect(handler.execute(command)).rejects.toThrow(
        new BandNotFoundException(mockBandId),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });

    it("should throw UserIsNotMemberOfBandException when user is not a member", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);

      const nonMemberId = UserId.generate().toPrimitive();
      const command = new LeaveBandCommand(mockBandId, nonMemberId);

      await expect(handler.execute(command)).rejects.toThrow(
        new UserIsNotMemberOfBandException(nonMemberId, mockBandId),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });

    it("should throw AdminCannotLeaveBandException when admin tries to leave", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);

      const command = new LeaveBandCommand(mockBandId, mockAdminId);

      await expect(handler.execute(command)).rejects.toThrow(
        new AdminCannotLeaveBandException(mockAdminId, mockBandId),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });
  });
});

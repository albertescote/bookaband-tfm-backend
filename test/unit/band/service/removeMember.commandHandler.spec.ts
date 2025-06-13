import { Test, TestingModule } from "@nestjs/testing";
import { RemoveMemberCommandHandler } from "../../../../src/context/band/service/removeMember.commandHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { RemoveMemberCommand } from "../../../../src/context/band/service/removeMember.command";
import { BandNotFoundException } from "../../../../src/context/band/exceptions/bandNotFoundException";
import { WrongPermissionsException } from "../../../../src/context/band/exceptions/wrongPermissionsException";
import { FailedToUpdateBandAfterLeavingException } from "../../../../src/context/band/exceptions/failedToUpdateBandAfterLeavingException";
import Band, { BandPrimitives } from "../../../../src/context/band/domain/band";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { BandSize } from "../../../../src/context/band/domain/bandSize";

describe("RemoveMemberCommandHandler", () => {
  let handler: RemoveMemberCommandHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();
  const mockAdminId = UserId.generate().toPrimitive();
  const mockMemberToRemoveId = UserId.generate().toPrimitive();

  const mockBandPrimitives: BandPrimitives = {
    id: mockBandId,
    name: "Test Band",
    members: [
      { id: mockUserId, role: BandRole.MEMBER },
      { id: mockAdminId, role: BandRole.ADMIN },
      { id: mockMemberToRemoveId, role: BandRole.MEMBER },
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
        RemoveMemberCommandHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<RemoveMemberCommandHandler>(RemoveMemberCommandHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should remove member from band and update repository", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);
      mockBandRepository.updateBand.mockResolvedValueOnce(mockBand);

      const command = new RemoveMemberCommand(
        mockBandId,
        mockAdminId,
        mockMemberToRemoveId,
      );
      await handler.execute(command);

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).toHaveBeenCalledWith(mockBand);
    });

    it("should throw BandNotFoundException when band does not exist", async () => {
      mockBandRepository.getBandById.mockResolvedValueOnce(undefined);

      const command = new RemoveMemberCommand(
        mockBandId,
        mockAdminId,
        mockMemberToRemoveId,
      );
      await expect(handler.execute(command)).rejects.toThrow(
        new BandNotFoundException(mockBandId),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });

    it("should throw WrongPermissionsException when user is not a member", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);

      const nonMemberId = UserId.generate().toPrimitive();
      const command = new RemoveMemberCommand(
        mockBandId,
        nonMemberId,
        mockMemberToRemoveId,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        new WrongPermissionsException("remove member - user is not a member"),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });

    it("should throw WrongPermissionsException when user is not an admin", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);

      const command = new RemoveMemberCommand(
        mockBandId,
        mockUserId,
        mockMemberToRemoveId,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        new WrongPermissionsException("remove member - only admins can remove members"),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });

    it("should throw WrongPermissionsException when member to remove is not found", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);

      const nonExistentMemberId = UserId.generate().toPrimitive();
      const command = new RemoveMemberCommand(
        mockBandId,
        mockAdminId,
        nonExistentMemberId,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        new WrongPermissionsException("remove member - member to remove not found"),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });

    it("should throw WrongPermissionsException when trying to remove the last admin", async () => {
      const singleAdminBandPrimitives = {
        ...mockBandPrimitives,
        members: [{ id: mockAdminId, role: BandRole.ADMIN }],
      };
      const mockBand = Band.fromPrimitives(singleAdminBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);

      const command = new RemoveMemberCommand(
        mockBandId,
        mockAdminId,
        mockAdminId,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        new WrongPermissionsException("remove member - cannot remove the last admin"),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).not.toHaveBeenCalled();
    });

    it("should throw FailedToUpdateBandAfterLeavingException when repository update fails", async () => {
      const mockBand = Band.fromPrimitives(mockBandPrimitives);
      mockBandRepository.getBandById.mockResolvedValueOnce(mockBand);
      mockBandRepository.updateBand.mockResolvedValueOnce(undefined);

      const command = new RemoveMemberCommand(
        mockBandId,
        mockAdminId,
        mockMemberToRemoveId,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        new FailedToUpdateBandAfterLeavingException(mockBandId),
      );

      expect(mockBandRepository.getBandById).toHaveBeenCalledWith(
        new BandId(mockBandId),
      );
      expect(mockBandRepository.updateBand).toHaveBeenCalledWith(mockBand);
    });
  });
});
 
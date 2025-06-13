import { Test, TestingModule } from "@nestjs/testing";
import { BandService } from "../../../../src/context/band/service/band.service";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import Band from "../../../../src/context/band/domain/band";
import { Role } from "../../../../src/context/shared/domain/role";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { BandNotFoundException } from "../../../../src/context/band/exceptions/bandNotFoundException";
import { WrongPermissionsException } from "../../../../src/context/band/exceptions/wrongPermissionsException";
import { BandNotCreatedException } from "../../../../src/context/band/exceptions/bandNotCreatedException";
import { BandNotUpdatedException } from "../../../../src/context/band/exceptions/bandNotUpdatedException";
import { NotAbleToExecuteBandDbTransactionException } from "../../../../src/context/band/exceptions/notAbleToExecuteBandDbTransactionException";
import { InvalidEventTypeIdException } from "../../../../src/context/band/exceptions/invalidEventTypeIdException";
import { InvalidMusicalStyleIdException } from "../../../../src/context/band/exceptions/invalidMusicalStyleIdException";
import { UserNotFoundException } from "../../../../src/context/band/exceptions/userNotFoundException";
import { MissingUserInfoToCreateBandException } from "../../../../src/context/band/exceptions/missingUserInfoToCreateBandException";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import User from "../../../../src/context/shared/domain/user";
import { EventTypePrimitives } from "../../../../src/context/shared/domain/eventType";
import { MusicalStylePrimitives } from "../../../../src/context/shared/domain/musicalStyle";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";

describe("BandService", () => {
  let service: BandService;
  let bandRepository: jest.Mocked<BandRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockEventTypeId = EventTypeId.generate().toPrimitive();
  const mockMusicalStyleId = MusicalStyleId.generate().toPrimitive();

  const mockUserAuthInfo = {
    id: mockUserId,
    role: Role.Musician,
    email: "test@example.com",
  };

  const mockUpsertBandRequest = {
    name: "Test Band",
    musicalStyleIds: [mockMusicalStyleId],
    price: 1000,
    location: "Barcelona",
    bandSize: "4-6",
    eventTypeIds: [mockEventTypeId],
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
      regions: ["Barcelona", "Madrid"],
      travelPreferences: "Within 100km",
      restrictions: "No outdoor venues",
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
  };

  const mockBand: Band = {
    toPrimitives: jest.fn().mockReturnValue({
      id: mockBandId,
      name: mockUpsertBandRequest.name,
      members: [{ id: mockUserId, role: BandRole.ADMIN }],
      musicalStyleIds: mockUpsertBandRequest.musicalStyleIds,
      price: mockUpsertBandRequest.price,
      location: mockUpsertBandRequest.location,
      bandSize: mockUpsertBandRequest.bandSize,
      eventTypeIds: mockUpsertBandRequest.eventTypeIds,
      weeklyAvailability: mockUpsertBandRequest.weeklyAvailability,
      hospitalityRider: mockUpsertBandRequest.hospitalityRider,
      technicalRider: mockUpsertBandRequest.technicalRider,
      performanceArea: mockUpsertBandRequest.performanceArea,
      media: mockUpsertBandRequest.media,
      socialLinks: mockUpsertBandRequest.socialLinks,
      bio: mockUpsertBandRequest.bio,
      imageUrl: mockUpsertBandRequest.imageUrl,
      visible: mockUpsertBandRequest.visible,
      reviewCount: 0,
      followers: 0,
      following: 0,
      createdAt: new Date(),
      featured: false,
    }),
    isAdmin: jest.fn().mockReturnValue(true),
  } as unknown as Band;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BandService,
        {
          provide: BandRepository,
          useValue: {
            addBand: jest.fn(),
            getBandById: jest.fn(),
            getUserBands: jest.fn(),
            updateBand: jest.fn(),
            deleteBand: jest.fn(),
          },
        },
        {
          provide: ModuleConnectors,
          useValue: {
            obtainUserInformation: jest.fn(),
            getAllEventTypes: jest.fn(),
            getAllMusicalStyles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BandService>(BandService);
    bandRepository = module.get(BandRepository);
    moduleConnectors = module.get(ModuleConnectors);

    jest.clearAllMocks();

    moduleConnectors.getAllEventTypes.mockResolvedValue([
      {
        id: mockEventTypeId,
        label: { en: "Wedding", es: "Boda" },
        icon: "🎉",
      } as EventTypePrimitives,
    ]);
    moduleConnectors.getAllMusicalStyles.mockResolvedValue([
      {
        id: mockMusicalStyleId,
        label: { en: "Rock", es: "Rock" },
        icon: "🎸",
      } as MusicalStylePrimitives,
    ]);
  });

  describe("create", () => {
    it("should create a band successfully", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockUserId,
          firstName: "John",
          familyName: "Doe",
          email: mockUserAuthInfo.email,
          role: mockUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      bandRepository.addBand.mockResolvedValue(mockBand);

      await service.create(mockUserAuthInfo, mockUpsertBandRequest);

      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        mockUserId,
      );
      expect(bandRepository.addBand).toHaveBeenCalled();
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(null);

      await expect(
        service.create(mockUserAuthInfo, mockUpsertBandRequest),
      ).rejects.toThrow(UserNotFoundException);
    });

    it("should throw MissingUserInfoToCreateBandException when user info is incomplete", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockUserId,
          firstName: "John",
          familyName: "Doe",
          email: mockUserAuthInfo.email,
          role: mockUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
        }),
      );

      await expect(
        service.create(mockUserAuthInfo, mockUpsertBandRequest),
      ).rejects.toThrow(MissingUserInfoToCreateBandException);
    });

    it("should throw BandNotCreatedException when band creation fails", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockUserId,
          firstName: "John",
          familyName: "Doe",
          email: mockUserAuthInfo.email,
          role: mockUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      bandRepository.addBand.mockResolvedValue(null);

      await expect(
        service.create(mockUserAuthInfo, mockUpsertBandRequest),
      ).rejects.toThrow(BandNotCreatedException);
    });

    it("should throw InvalidEventTypeIdException when event type is invalid", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockUserId,
          firstName: "John",
          familyName: "Doe",
          email: mockUserAuthInfo.email,
          role: mockUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      moduleConnectors.getAllEventTypes.mockResolvedValue([]);

      await expect(
        service.create(mockUserAuthInfo, mockUpsertBandRequest),
      ).rejects.toThrow(InvalidEventTypeIdException);
    });

    it("should throw InvalidMusicalStyleIdException when musical style is invalid", async () => {
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives({
          id: mockUserId,
          firstName: "John",
          familyName: "Doe",
          email: mockUserAuthInfo.email,
          role: mockUserAuthInfo.role,
          emailVerified: true,
          joinedDate: new Date().toDateString(),
          phoneNumber: "+34123456789",
          nationalId: "12345678X",
        }),
      );
      moduleConnectors.getAllMusicalStyles.mockResolvedValue([]);

      await expect(
        service.create(mockUserAuthInfo, mockUpsertBandRequest),
      ).rejects.toThrow(InvalidMusicalStyleIdException);
    });
  });

  describe("getById", () => {
    it("should return band when found", async () => {
      bandRepository.getBandById.mockResolvedValue(mockBand);

      const result = await service.getById(mockUserAuthInfo, mockBandId);

      expect(bandRepository.getBandById).toHaveBeenCalledWith(
        expect.any(BandId),
      );
      expect(result).toEqual({
        id: mockBandId,
        name: mockUpsertBandRequest.name,
        members: [{ id: mockUserId, role: BandRole.ADMIN }],
        musicalStyleIds: mockUpsertBandRequest.musicalStyleIds,
        imageUrl: mockUpsertBandRequest.imageUrl,
        bio: mockUpsertBandRequest.bio,
      });
    });

    it("should throw BandNotFoundException when band is not found", async () => {
      bandRepository.getBandById.mockResolvedValue(null);

      await expect(
        service.getById(mockUserAuthInfo, mockBandId),
      ).rejects.toThrow(BandNotFoundException);
    });
  });

  describe("getUserBands", () => {
    it("should return user bands", async () => {
      const mockUserBands = [
        {
          id: mockBandId,
          name: mockUpsertBandRequest.name,
          imageUrl: mockUpsertBandRequest.imageUrl,
        },
      ];
      bandRepository.getUserBands.mockResolvedValue(mockUserBands);

      const result = await service.getUserBands(mockUserAuthInfo);

      expect(bandRepository.getUserBands).toHaveBeenCalledWith(
        expect.any(UserId),
      );
      expect(result).toEqual(mockUserBands);
    });
  });

  describe("update", () => {
    it("should update band successfully when user is admin", async () => {
      bandRepository.getBandById.mockResolvedValue(mockBand);
      bandRepository.updateBand.mockResolvedValue(mockBand);

      await service.update(mockUserAuthInfo, mockBandId, mockUpsertBandRequest);

      expect(bandRepository.getBandById).toHaveBeenCalledWith(
        expect.any(BandId),
      );
      expect(bandRepository.updateBand).toHaveBeenCalled();
    });

    it("should throw BandNotFoundException when band is not found", async () => {
      bandRepository.getBandById.mockResolvedValue(null);

      await expect(
        service.update(mockUserAuthInfo, mockBandId, mockUpsertBandRequest),
      ).rejects.toThrow(BandNotFoundException);
    });

    it("should throw WrongPermissionsException when user is not a member", async () => {
      (mockBand.toPrimitives as jest.Mock).mockReturnValueOnce({
        ...mockBand.toPrimitives(),
        members: [],
      });
      bandRepository.getBandById.mockResolvedValue(mockBand);

      await expect(
        service.update(mockUserAuthInfo, mockBandId, mockUpsertBandRequest),
      ).rejects.toThrow(WrongPermissionsException);
    });

    it("should throw BandNotUpdatedException when update fails", async () => {
      bandRepository.getBandById.mockResolvedValue(mockBand);
      bandRepository.updateBand.mockResolvedValue(null);

      await expect(
        service.update(mockUserAuthInfo, mockBandId, mockUpsertBandRequest),
      ).rejects.toThrow(BandNotUpdatedException);
    });
  });

  describe("deleteById", () => {
    it("should delete band successfully when user is admin", async () => {
      bandRepository.getBandById.mockResolvedValue(mockBand);
      bandRepository.deleteBand.mockResolvedValue(true);

      await service.deleteById(mockUserAuthInfo, mockBandId);

      expect(bandRepository.getBandById).toHaveBeenCalledWith(
        expect.any(BandId),
      );
      expect(bandRepository.deleteBand).toHaveBeenCalledWith(
        expect.any(BandId),
      );
    });

    it("should throw BandNotFoundException when band is not found", async () => {
      bandRepository.getBandById.mockResolvedValue(null);

      await expect(
        service.deleteById(mockUserAuthInfo, mockBandId),
      ).rejects.toThrow(BandNotFoundException);
    });

    it("should throw WrongPermissionsException when user is not admin", async () => {
      (mockBand.isAdmin as jest.Mock).mockReturnValueOnce(false);
      bandRepository.getBandById.mockResolvedValue(mockBand);

      await expect(
        service.deleteById(mockUserAuthInfo, mockBandId),
      ).rejects.toThrow(WrongPermissionsException);
    });

    it("should throw NotAbleToExecuteBandDbTransactionException when deletion fails", async () => {
      bandRepository.getBandById.mockResolvedValue(mockBand);
      bandRepository.deleteBand.mockResolvedValue(false);

      await expect(
        service.deleteById(mockUserAuthInfo, mockBandId),
      ).rejects.toThrow(NotAbleToExecuteBandDbTransactionException);
    });
  });
});

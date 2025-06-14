import { Test, TestingModule } from "@nestjs/testing";
import { BandController } from "../../../../src/app/api/band/band.controller";
import { BandService } from "../../../../src/context/band/service/band.service";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { UpsertBandRequestDto } from "../../../../src/app/api/band/upsertBandRequest.dto";
import { BandResponseDto } from "../../../../src/app/api/band/bandResponse.dto";
import { GetUserBandsResponse } from "../../../../src/app/api/band/getUserBandsResponse.dto";
import { FilteredBandsResponseDto } from "../../../../src/app/api/band/filteredBandsResponse.dto";
import { FeaturedBandsResponseDto } from "../../../../src/app/api/band/featuredBandsResponse.dto";
import { BandProfileResponseDto } from "../../../../src/app/api/band/bandProfileResponse.dto";
import { LeaveBandCommand } from "../../../../src/context/band/service/leaveBand.command";
import { RemoveMemberCommand } from "../../../../src/context/band/service/removeMember.command";
import { GetFilteredBandsQuery } from "../../../../src/context/band/service/getFilteredBands.query";
import { GetFeaturedBandsQuery } from "../../../../src/context/band/service/getFeaturedBands.query";
import { GetBandProfileQuery } from "../../../../src/context/band/service/getBandProfile.query";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { Role } from "../../../../src/context/shared/domain/role";

describe("BandController", () => {
  let controller: BandController;
  let bandService: BandService;

  const mockBandService = {
    create: jest.fn(),
    getUserBands: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  const mockQueryBus = {
    execute: jest.fn(),
  };

  const mockUser: UserAuthInfo = {
    id: "user-123",
    email: "test@example.com",
    role: Role.Musician,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BandController],
      providers: [
        {
          provide: BandService,
          useValue: mockBandService,
        },
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
        {
          provide: QueryBus,
          useValue: mockQueryBus,
        },
      ],
    }).compile();

    controller = module.get<BandController>(BandController);
    bandService = module.get<BandService>(BandService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new band", async () => {
      const createBandDto: UpsertBandRequestDto = {
        name: "Test Band",
        musicalStyleIds: ["style-1"],
        price: 1000,
        location: "Test Location",
        bandSize: "MEDIUM",
        eventTypeIds: ["event-1"],
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
          accommodation: "accommodation description",
          catering: "catering description",
          beverages: "beverages description",
          specialRequirements: "special requirements description",
        },
        technicalRider: {
          soundSystem: "Test",
          microphones: "Test",
          backline: "Test",
          lighting: "Test",
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
      };

      await controller.create({ user: mockUser }, createBandDto);

      expect(bandService.create).toHaveBeenCalledWith(mockUser, createBandDto);
    });
  });

  describe("getUserBands", () => {
    it("should return user bands", async () => {
      const expectedBands: GetUserBandsResponse[] = [
        {
          id: "band-1",
          name: "Test Band",
          imageUrl: "http://example.com/image.jpg",
        },
      ];

      mockBandService.getUserBands.mockResolvedValue(expectedBands);

      const result = await controller.getUserBands({ user: mockUser });

      expect(result).toEqual(expectedBands);
      expect(bandService.getUserBands).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("getFilteredBands", () => {
    it("should return filtered bands", async () => {
      const expectedResponse: FilteredBandsResponseDto = {
        bandCatalogItems: [],
        hasMore: false,
        total: 0,
      };

      mockQueryBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.getFilteredBands(
        { user: mockUser },
        1,
        10,
        "Test Location",
        "Test Query",
        "2024-03-20",
      );

      expect(result).toEqual(expectedResponse);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetFilteredBandsQuery),
      );
    });
  });

  describe("getFeaturedBands", () => {
    it("should return featured bands", async () => {
      const expectedResponse: FeaturedBandsResponseDto = {
        featuredBands: [],
        hasMore: false,
        total: 0,
      };

      mockQueryBus.execute.mockResolvedValue(expectedResponse);

      const result = await controller.getFeaturedBands(
        { user: mockUser },
        1,
        10,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetFeaturedBandsQuery),
      );
    });
  });

  describe("getBandProfile", () => {
    it("should return band profile", async () => {
      const expectedProfile: BandProfileResponseDto = {
        id: "band-1",
        name: "Test Band",
        musicalStyleIds: ["style-1"],
        bookingDates: [],
        location: "Test Location",
        featured: false,
        bandSize: BandSize.BAND,
        eventTypeIds: ["event-1"],
        reviewCount: 0,
        createdDate: new Date(),
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
          accommodation: "accommodation description",
          catering: "catering description",
          beverages: "beverages description",
          specialRequirements: "special requirements description",
        },
        technicalRider: {
          soundSystem: "Test",
          microphones: "Test",
          backline: "Test",
          lighting: "Test",
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
        media: [],
        socialLinks: [],
        followers: 0,
        following: 0,
        reviews: [],
        events: [],
      };

      mockQueryBus.execute.mockResolvedValue(expectedProfile);

      const result = await controller.getBandProfile(
        { id: "band-1" },
        { user: mockUser },
      );

      expect(result).toEqual(expectedProfile);
      expect(mockQueryBus.execute).toHaveBeenCalledWith(
        expect.any(GetBandProfileQuery),
      );
    });
  });

  describe("getById", () => {
    it("should return band by id", async () => {
      const expectedBand: BandResponseDto = {
        id: "band-1",
        name: "Test Band",
        members: [],
        musicalStyleIds: ["style-1"],
      };

      mockBandService.getById.mockResolvedValue(expectedBand);

      const result = await controller.getById(
        { id: "band-1" },
        { user: mockUser },
      );

      expect(result).toEqual(expectedBand);
      expect(bandService.getById).toHaveBeenCalledWith(mockUser, "band-1");
    });
  });

  describe("update", () => {
    it("should update band", async () => {
      const updateBandDto: UpsertBandRequestDto = {
        name: "Updated Band",
        musicalStyleIds: ["style-1"],
        price: 1000,
        location: "Test Location",
        bandSize: "MEDIUM",
        eventTypeIds: ["event-1"],
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
          accommodation: "accommodation description",
          catering: "catering description",
          beverages: "beverages description",
          specialRequirements: "special requirements description",
        },
        technicalRider: {
          soundSystem: "Test",
          microphones: "Test",
          backline: "Test",
          lighting: "Test",
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
      };

      await controller.update(
        { id: "band-1" },
        { user: mockUser },
        updateBandDto,
      );

      expect(bandService.update).toHaveBeenCalledWith(
        mockUser,
        "band-1",
        updateBandDto,
      );
    });
  });

  describe("delete", () => {
    it("should delete band", async () => {
      await controller.delete({ user: mockUser }, { id: "band-1" });

      expect(bandService.deleteById).toHaveBeenCalledWith(mockUser, "band-1");
    });
  });

  describe("leave", () => {
    it("should leave band", async () => {
      await controller.leave({ user: mockUser }, { id: "band-1" });

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(LeaveBandCommand),
      );
    });
  });

  describe("removeMember", () => {
    it("should remove member from band", async () => {
      await controller.removeMember({ user: mockUser }, "band-1", "member-1");

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(RemoveMemberCommand),
      );
    });
  });
});

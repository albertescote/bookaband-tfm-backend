import { Test, TestingModule } from "@nestjs/testing";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import Band, {
  WeeklyAvailability,
} from "../../../../src/context/band/domain/band";
import { Role } from "../../../../src/context/shared/domain/role";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { v4 as uuidv4 } from "uuid";
import { LocationRegionChecker } from "../../../../src/context/band/infrastructure/locationRegionChecker";

describe("BandRepository Integration Tests", () => {
  let repository: BandRepository;
  let prismaService: PrismaService;
  let testUserId: string;
  let testBandId: string;
  let testTechnicalRiderId: string;
  let testHospitalityRiderId: string;
  let testPerformanceAreaId: string;

  const mockLocationRegionChecker = {
    isLocationInRegions: jest.fn().mockResolvedValue(true),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BandRepository,
        PrismaService,
        {
          provide: LocationRegionChecker,
          useValue: mockLocationRegionChecker,
        },
      ],
    }).compile();

    repository = module.get<BandRepository>(BandRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.band.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.technicalRider.deleteMany({});
    await prismaService.hospitalityRider.deleteMany({});
    await prismaService.performanceArea.deleteMany({});
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await prismaService.band.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.technicalRider.deleteMany({});
    await prismaService.hospitalityRider.deleteMany({});
    await prismaService.performanceArea.deleteMany({});

    testUserId = uuidv4();
    testBandId = uuidv4();
    testTechnicalRiderId = uuidv4();
    testHospitalityRiderId = uuidv4();
    testPerformanceAreaId = uuidv4();

    await prismaService.user.create({
      data: {
        id: testUserId,
        firstName: "Test",
        familyName: "User",
        email: "test@example.com",
        role: Role.Musician,
        phoneNumber: "123456789",
      },
    });

    await prismaService.technicalRider.create({
      data: {
        id: testTechnicalRiderId,
        soundSystem: "Professional PA system",
        microphones: "4 wireless microphones",
        backline: "Synthesizers and drum machines",
        lighting: "Basic stage lighting",
        otherRequirements: "Power outlets and extension cords",
      },
    });

    await prismaService.hospitalityRider.create({
      data: {
        id: testHospitalityRiderId,
        accommodation: "Hotel room for each band member",
        catering: "Full board meals",
        beverages: "Water, soft drinks, and alcoholic beverages",
        specialRequirements: "Vegetarian options available",
      },
    });

    await prismaService.performanceArea.create({
      data: {
        id: testPerformanceAreaId,
        regions: ["Barcelona", "Girona", "Tarragona"],
        gasPriceCalculation: {
          fuelConsumption: 9.5,
          useDynamicPricing: false,
          pricePerLiter: 1.88,
        },
        otherComments: "Prefer venues with good acoustics",
      },
    });
  });

  describe("addBand", () => {
    it("should create a new band", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        false,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );

      const createdBand = await repository.addBand(band);

      expect(createdBand).toBeDefined();
      expect(createdBand.toPrimitives()).toEqual({
        id: testBandId,
        name: "Test Band",
        members: [{ id: testUserId, role: BandRole.ADMIN }],
        musicalStyleIds: ["rock", "pop"],
        followers: 0,
        following: 0,
        createdAt: expect.any(Date),
        price: 1000,
        location: "Barcelona",
        bandSize: BandSize.BAND,
        eventTypeIds: ["wedding", "corporate"],
        featured: false,
        visible: true,
        weeklyAvailability,
        hospitalityRider: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        technicalRider: {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
        performanceArea: {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        reviewCount: 0,
        media: [],
        socialLinks: [],
      });
    });
  });

  describe("getBandById", () => {
    it("should return undefined for non-existent band", async () => {
      const result = await repository.getBandById(new BandId(uuidv4()));
      expect(result).toBeUndefined();
    });

    it("should find band by id", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        false,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );
      await repository.addBand(band);

      const foundBand = await repository.getBandById(new BandId(testBandId));

      expect(foundBand).toBeDefined();
      expect(foundBand.toPrimitives()).toEqual({
        id: testBandId,
        name: "Test Band",
        members: [{ id: testUserId, role: BandRole.ADMIN }],
        musicalStyleIds: ["rock", "pop"],
        followers: 0,
        following: 0,
        createdAt: expect.any(Date),
        price: 1000,
        location: "Barcelona",
        bandSize: BandSize.BAND,
        eventTypeIds: ["wedding", "corporate"],
        featured: false,
        visible: true,
        weeklyAvailability,
        hospitalityRider: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        technicalRider: {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
        performanceArea: {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        reviewCount: 0,
        media: [],
        socialLinks: [],
      });
    });
  });

  describe("updateBand", () => {
    it("should update an existing band", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        false,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );
      await repository.addBand(band);

      const updatedBand = new Band(
        new BandId(testBandId),
        "Updated Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop", "jazz"],
        0,
        0,
        new Date(),
        1500,
        "Madrid",
        BandSize.BAND,
        ["wedding", "corporate", "festival"],
        true,
        true,
        weeklyAvailability,
        {
          regions: ["Madrid", "Castilla y León", "Castilla-La Mancha"],
          gasPriceCalculation: {
            fuelConsumption: 7,
            useDynamicPricing: true,
          },
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );

      const result = await repository.updateBand(updatedBand);

      expect(result).toBeDefined();
      expect(result.toPrimitives()).toEqual({
        id: testBandId,
        name: "Updated Band",
        members: [{ id: testUserId, role: BandRole.ADMIN }],
        musicalStyleIds: ["rock", "pop", "jazz"],
        followers: 0,
        following: 0,
        createdAt: expect.any(Date),
        price: 1500,
        location: "Madrid",
        bandSize: BandSize.BAND,
        eventTypeIds: ["wedding", "corporate", "festival"],
        featured: true,
        visible: true,
        weeklyAvailability,
        hospitalityRider: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        technicalRider: {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
        performanceArea: {
          regions: ["Madrid", "Castilla y León", "Castilla-La Mancha"],
          gasPriceCalculation: {
            fuelConsumption: 7,
            useDynamicPricing: true,
          },
        },
        reviewCount: 0,
        media: [],
        socialLinks: [],
      });
    });
  });

  describe("deleteBand", () => {
    it("should delete a band", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        false,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );
      await repository.addBand(band);

      const result = await repository.deleteBand(new BandId(testBandId));
      expect(result).toBe(true);

      const foundBand = await repository.getBandById(new BandId(testBandId));
      expect(foundBand).toBeUndefined();
    });
  });

  describe("getUserBands", () => {
    it("should return bands for a user", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        false,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );
      await repository.addBand(band);

      const userBands = await repository.getUserBands(new UserId(testUserId));

      expect(userBands).toHaveLength(1);
      expect(userBands[0]).toEqual({
        id: testBandId,
        name: "Test Band",
        imageUrl: null,
      });
    });
  });

  describe("getBandProfileById", () => {
    it("should return band profile", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        false,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );
      await repository.addBand(band);

      const bandProfile = await repository.getBandProfileById(
        new BandId(testBandId),
      );

      expect(bandProfile).toBeDefined();
      expect(bandProfile).toEqual({
        id: testBandId,
        name: "Test Band",
        musicalStyleIds: ["rock", "pop"],
        bookingDates: [],
        location: "Barcelona",
        featured: false,
        bandSize: BandSize.BAND,
        eventTypeIds: ["wedding", "corporate"],
        reviewCount: 0,
        createdDate: expect.any(Date),
        weeklyAvailability,
        hospitalityRider: {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        technicalRider: {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
        performanceArea: {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        followers: 0,
        following: 0,
        reviews: [],
        media: [],
        events: [],
        socialLinks: [],
        members: [
          {
            id: testUserId,
            role: BandRole.ADMIN,
            name: "Test User",
            imageUrl: undefined,
          },
        ],
        price: 1000,
      });
    });
  });

  describe("getFilteredBandCatalogItems", () => {
    it("should return filtered band catalog items", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        false,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );
      await repository.addBand(band);

      const { bandCatalogItems, total } =
        await repository.getFilteredBandCatalogItems(1, 10);

      expect(total).toBe(1);
      expect(bandCatalogItems).toHaveLength(1);
      expect(bandCatalogItems[0]).toEqual({
        id: testBandId,
        name: "Test Band",
        musicalStyleIds: ["rock", "pop"],
        bookingDates: [],
        weeklyAvailability,
        location: "Barcelona",
        featured: false,
        bandSize: BandSize.BAND,
        eventTypeIds: ["wedding", "corporate"],
        reviewCount: 0,
        bio: undefined,
        price: 1000,
        imageUrl: undefined,
        rating: undefined,
        hospitalityRider: {
          id: expect.any(String),
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        technicalRider: {
          id: expect.any(String),
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
        performanceArea: {
          id: expect.any(String),
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
      });
    });
  });

  describe("getFeaturedBands", () => {
    it("should return featured bands", async () => {
      const weeklyAvailability: WeeklyAvailability = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };

      const band = new Band(
        new BandId(testBandId),
        "Test Band",
        [{ id: new UserId(testUserId), role: BandRole.ADMIN }],
        ["rock", "pop"],
        0,
        0,
        new Date(),
        1000,
        "Barcelona",
        BandSize.BAND,
        ["wedding", "corporate"],
        true,
        true,
        weeklyAvailability,
        {
          regions: ["Barcelona", "Girona", "Tarragona"],
          gasPriceCalculation: {
            fuelConsumption: 9.5,
            useDynamicPricing: false,
            pricePerLiter: 1.88,
          },
          otherComments: "Prefer venues with good acoustics",
        },
        0,
        [],
        [],
        {
          accommodation: "Hotel room for each band member",
          catering: "Full board meals",
          beverages: "Water, soft drinks, and alcoholic beverages",
          specialRequirements: "Vegetarian options available",
        },
        {
          soundSystem: "Professional PA system",
          microphones: "4 wireless microphones",
          backline: "Synthesizers and drum machines",
          lighting: "Basic stage lighting",
          otherRequirements: "Power outlets and extension cords",
        },
      );
      await repository.addBand(band);

      const { featuredBands, total } = await repository.getFeaturedBands(1, 10);

      expect(total).toBe(1);
      expect(featuredBands).toHaveLength(1);
      expect(featuredBands[0]).toEqual({
        id: testBandId,
        name: "Test Band",
        musicalStyleIds: ["rock", "pop"],
        price: 1000,
        imageUrl: undefined,
        bio: undefined,
      });
    });
  });
});

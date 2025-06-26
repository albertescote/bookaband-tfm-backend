import { Test, TestingModule } from "@nestjs/testing";
import { ArtistReviewRepository } from "../../../../src/context/artistReview/infrastructure/artistReview.repository";
import { ArtistReviewModule } from "../../../../src/context/artistReview/artistReview.module";
import { ArtistReview } from "../../../../src/context/artistReview/domain/artistReview";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { ArtistReviewId } from "../../../../src/context/artistReview/domain/artistReviewId";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import { Role } from "../../../../src/context/shared/domain/role";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { v4 as uuidv4 } from "uuid";

describe("ArtistReviewRepository Integration Tests", () => {
  let repository: ArtistReviewRepository;
  let prismaService: PrismaService;

  const testUserId = UserId.generate().toPrimitive();
  const testBandId = BandId.generate().toPrimitive();
  const testTechnicalRiderId = uuidv4();
  const testHospitalityRiderId = uuidv4();
  const testPerformanceAreaId = uuidv4();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ArtistReviewModule],
    }).compile();

    repository = moduleFixture.get<ArtistReviewRepository>(
      ArtistReviewRepository,
    );
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });
  beforeAll(async () => {
    await prismaService.user.create({
      data: {
        id: testUserId,
        email: "test@example.com",
        password: "hashedPassword",
        firstName: "Test",
        familyName: "User",
        role: Role.Client,
      },
    });

    await prismaService.technicalRider.create({
      data: {
        id: testTechnicalRiderId,
        soundSystem: "Test Sound System",
        microphones: "Test Microphones",
        backline: "Test Backline",
        lighting: "Test Lighting",
      },
    });

    await prismaService.hospitalityRider.create({
      data: {
        id: testHospitalityRiderId,
        accommodation: "Test Accommodation",
        catering: "Test Catering",
        beverages: "Test Beverages",
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

    await prismaService.band.create({
      data: {
        id: testBandId,
        name: "Test Band",
        musicalStyleIds: [],
        followers: 0,
        following: 0,
        createdAt: new Date(),
        price: 100,
        location: "Test Location",
        bandSize: BandSize.BAND,
        eventTypeIds: [],
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
        technicalRiderId: testTechnicalRiderId,
        hospitalityRiderId: testHospitalityRiderId,
        performanceAreaId: testPerformanceAreaId,
        imageUrl: "test-image-url",
      },
    });
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({ where: { id: testUserId } });
    await prismaService.band.deleteMany({ where: { id: testBandId } });
    await prismaService.technicalRider.deleteMany({
      where: { id: testTechnicalRiderId },
    });
    await prismaService.hospitalityRider.deleteMany({
      where: { id: testHospitalityRiderId },
    });
    await prismaService.performanceArea.deleteMany({
      where: { id: testPerformanceAreaId },
    });
    await prismaService.$disconnect();
  });

  beforeEach(async () => {});

  describe("create", () => {
    it("should store a new artist review successfully", async () => {
      const artistReview = new ArtistReview(
        ArtistReviewId.generate(),
        new UserId(testUserId),
        new BandId(testBandId),
        5,
        "Excellent performance!",
        new Date(),
      );

      try {
        const createdReview = await repository.create(artistReview);

        expect(createdReview).toStrictEqual(artistReview);
      } finally {
        await prismaService.artistReview.deleteMany({
          where: { id: artistReview.toPrimitives().id },
        });
      }
    });

    it("should return undefined when database operation fails", async () => {
      const invalidUserId = UserId.generate().toPrimitive();
      const artistReview = new ArtistReview(
        ArtistReviewId.generate(),
        new UserId(invalidUserId),
        new BandId(testBandId),
        5,
        "Test comment",
        new Date(),
      );

      try {
        const result = await repository.create(artistReview);

        expect(result).toBeUndefined();
      } finally {
        await prismaService.artistReview.deleteMany({
          where: { id: artistReview.toPrimitives().id },
        });
      }
    });

    it("should return undefined for duplicate review creation", async () => {
      const artistReview = new ArtistReview(
        ArtistReviewId.generate(),
        new UserId(testUserId),
        new BandId(testBandId),
        5,
        "Test comment",
        new Date(),
      );

      try {
        const firstResult = await repository.create(artistReview);

        const secondResult = await repository.create(artistReview);

        expect(firstResult).toBeDefined();
        expect(secondResult).toBeUndefined();
      } finally {
        await prismaService.artistReview.deleteMany({
          where: { id: artistReview.toPrimitives().id },
        });
      }
    });

    it("should return undefined for bandId-userId unique violation", async () => {
      const artistReview1 = new ArtistReview(
        ArtistReviewId.generate(),
        new UserId(testUserId),
        new BandId(testBandId),
        5,
        "Test comment",
        new Date(),
      );

      const artistReview2 = new ArtistReview(
        ArtistReviewId.generate(),
        new UserId(testUserId),
        new BandId(testBandId),
        4,
        "Test comment 2",
        new Date(),
      );

      try {
        const firstResult = await repository.create(artistReview1);
        const secondResult = await repository.create(artistReview2);

        expect(firstResult).toBeDefined();
        expect(secondResult).toBeUndefined();
      } finally {
        await prismaService.artistReview.deleteMany({
          where: { id: artistReview1.toPrimitives().id },
        });
      }
    });
  });
});

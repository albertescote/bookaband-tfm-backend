import { Test, TestingModule } from "@nestjs/testing";
import { InvitationRepository } from "../../../../src/context/invitation/infrastructure/invitation.repository";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import Invitation from "../../../../src/context/invitation/domain/invitation";
import InvitationId from "../../../../src/context/invitation/domain/invitationId";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import { InvitationStatus } from "../../../../src/context/shared/domain/invitationStatus";
import { Role } from "../../../../src/context/shared/domain/role";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { v4 as uuidv4 } from "uuid";

describe("InvitationRepository Integration Tests", () => {
  let repository: InvitationRepository;
  let prismaService: PrismaService;
  let module: TestingModule;

  let testUserId: string;
  let testBandId: string;
  let testInvitation: Invitation;
  const performanceAreaId = uuidv4();
  const technicalRiderId = uuidv4();
  const hospitalityRiderId = uuidv4();

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [InvitationRepository, PrismaService],
    }).compile();

    repository = module.get<InvitationRepository>(InvitationRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    const testUser = await prismaService.user.create({
      data: {
        id: UserId.generate().toPrimitive(),
        firstName: "Test",
        familyName: "User",
        email: `test-${Date.now()}@example.com`,
        role: Role.Client,
        password: "hashedPassword",
        joinedDate: new Date(),
      },
    });
    testUserId = testUser.id;

    await prismaService.technicalRider.create({
      data: {
        id: technicalRiderId,
        soundSystem: "Test Sound System",
        microphones: "Test Microphones",
        backline: "Test Backline",
        lighting: "Test Lighting",
      },
    });

    await prismaService.hospitalityRider.create({
      data: {
        id: hospitalityRiderId,
        accommodation: "Test Accommodation",
        catering: "Test Catering",
        beverages: "Test Beverages",
      },
    });

    await prismaService.performanceArea.create({
      data: {
        id: performanceAreaId,
        regions: ["Barcelona", "Girona", "Tarragona"],
        gasPriceCalculation: {
          fuelConsumption: 9.5,
          useDynamicPricing: false,
          pricePerLiter: 1.88,
        },
        otherComments: "Prefer venues with good acoustics",
      },
    });

    const testBand = await prismaService.band.create({
      data: {
        id: BandId.generate().toPrimitive(),
        name: "Test Band",
        musicalStyleIds: [],
        followers: 0,
        following: 0,
        createdAt: new Date(),
        price: 1000,
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
        technicalRiderId,
        hospitalityRiderId,
        performanceAreaId,
      },
    });
    testBandId = testBand.id;

    testInvitation = Invitation.create(
      new BandId(testBandId),
      new UserId(testUserId),
    );
    await repository.save(testInvitation);
  });

  afterEach(async () => {
    await prismaService.invitation.deleteMany({
      where: { id: testInvitation.toPrimitives().id },
    });
    await prismaService.band.deleteMany({
      where: { id: testBandId },
    });
    await prismaService.technicalRider.deleteMany({
      where: { id: technicalRiderId },
    });
    await prismaService.hospitalityRider.deleteMany({
      where: { id: hospitalityRiderId },
    });
    await prismaService.performanceArea.deleteMany({
      where: { id: performanceAreaId },
    });
    await prismaService.user.deleteMany({
      where: { id: testUserId },
    });
  });

  afterAll(async () => {
    await module.close();
  });

  describe("findById", () => {
    it("should find an invitation by id", async () => {
      const foundInvitation = await repository.findById(
        new InvitationId(testInvitation.toPrimitives().id),
      );

      expect(foundInvitation).toBeDefined();
      expect(foundInvitation.toPrimitives()).toEqual(
        testInvitation.toPrimitives(),
      );
    });

    it("should return undefined when invitation is not found", async () => {
      const foundInvitation = await repository.findById(
        new InvitationId(uuidv4()),
      );

      expect(foundInvitation).toBeUndefined();
    });
  });

  describe("findPendingInvitationByBandAndUser", () => {
    it("should find a pending invitation by band and user", async () => {
      const foundInvitation =
        await repository.findPendingInvitationByBandAndUser(
          new BandId(testBandId),
          new UserId(testUserId),
        );

      expect(foundInvitation).toBeDefined();
      expect(foundInvitation.toPrimitives()).toEqual(
        testInvitation.toPrimitives(),
      );
    });

    it("should return undefined when no pending invitation is found", async () => {
      const foundInvitation =
        await repository.findPendingInvitationByBandAndUser(
          new BandId(uuidv4()),
          new UserId(testUserId),
        );

      expect(foundInvitation).toBeUndefined();
    });
  });

  describe("findByUser", () => {
    it("should find all invitations for a user", async () => {
      const userInvitations = await repository.findByUser(
        new UserId(testUserId),
      );

      expect(userInvitations).toHaveLength(1);
      expect(userInvitations[0]).toEqual({
        id: testInvitation.toPrimitives().id,
        bandId: testBandId,
        bandName: "Test Band",
        userId: testUserId,
        status: InvitationStatus.PENDING,
        createdAt: expect.any(Date),
      });
    });

    it("should return empty array when user has no invitations", async () => {
      const userInvitations = await repository.findByUser(new UserId(uuidv4()));

      expect(userInvitations).toHaveLength(0);
    });
  });

  describe("save", () => {
    it("should create a new invitation", async () => {
      const newInvitation = Invitation.create(
        new BandId(testBandId),
        new UserId(testUserId),
      );
      const savedInvitation = await repository.save(newInvitation);

      expect(savedInvitation).toBeDefined();
      expect(savedInvitation.toPrimitives()).toEqual(
        newInvitation.toPrimitives(),
      );
    });

    it("should update an existing invitation", async () => {
      testInvitation.accept();
      const updatedInvitation = await repository.save(testInvitation);

      expect(updatedInvitation).toBeDefined();
      expect(updatedInvitation.toPrimitives().status).toBe(
        InvitationStatus.ACCEPTED,
      );
    });
  });
});

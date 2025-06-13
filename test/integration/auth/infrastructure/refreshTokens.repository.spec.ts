import { Test, TestingModule } from "@nestjs/testing";
import { RefreshTokensRepository } from "../../../../src/context/auth/infrastructure/refreshTokens.repository";
import { RefreshToken } from "../../../../src/context/auth/domain/refreshToken";
import { Role } from "../../../../src/context/shared/domain/role";
import UserId from "../../../../src/context/shared/domain/userId";
import PrismaService from "../../../../src/context/shared/infrastructure/db/prisma.service";
import { v4 as uuidv4 } from "uuid";

describe("RefreshTokensRepository Integration Tests", () => {
  let repository: RefreshTokensRepository;
  let prismaService: PrismaService;
  let testUserId: string;
  let testToken: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokensRepository, PrismaService],
    }).compile();

    repository = module.get<RefreshTokensRepository>(RefreshTokensRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.refreshToken.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await prismaService.refreshToken.deleteMany({});
    await prismaService.user.deleteMany({});

    testUserId = uuidv4();
    testToken = "test-refresh-token";

    await prismaService.user.create({
      data: {
        id: testUserId,
        firstName: "Test",
        familyName: "User",
        email: "test@example.com",
        role: Role.Client,
        phoneNumber: "123456789",
      },
    });
  });

  describe("createRefreshToken", () => {
    it("should create a new refresh token", async () => {
      const refreshToken = RefreshToken.create(
        testToken,
        new UserId(testUserId),
      );

      const createdRefreshToken =
        await repository.createRefreshToken(refreshToken);

      expect(createdRefreshToken).toBeDefined();
      expect(createdRefreshToken.toPrimitives()).toEqual({
        id: expect.any(String),
        userId: testUserId,
        token: testToken,
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      });

      const dbRefreshToken = await prismaService.refreshToken.findUnique({
        where: { token: testToken },
      });
      expect(dbRefreshToken).toBeDefined();
      expect(dbRefreshToken).toEqual({
        id: expect.any(String),
        userId: testUserId,
        token: testToken,
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      });
    });
  });

  describe("findRefreshToken", () => {
    it("should return undefined for non-existent token", async () => {
      const result = await repository.findRefreshToken("non-existent-token");
      expect(result).toBeUndefined();
    });

    it("should find refresh token by token", async () => {
      const refreshToken = RefreshToken.create(
        testToken,
        new UserId(testUserId),
      );
      await repository.createRefreshToken(refreshToken);

      const foundRefreshToken = await repository.findRefreshToken(testToken);

      expect(foundRefreshToken).toBeDefined();
      expect(foundRefreshToken.toPrimitives()).toEqual({
        id: expect.any(String),
        userId: testUserId,
        token: testToken,
        createdAt: expect.any(Date),
        expiresAt: expect.any(Date),
      });
    });
  });

  describe("deleteRefreshToken", () => {
    it("should return false when trying to delete non-existent token", async () => {
      const result = await repository.deleteRefreshToken("non-existent-token");
      expect(result).toBe(false);
    });

    it("should delete refresh token and return true", async () => {
      const refreshToken = RefreshToken.create(
        testToken,
        new UserId(testUserId),
      );
      await repository.createRefreshToken(refreshToken);

      const result = await repository.deleteRefreshToken(testToken);
      expect(result).toBe(true);

      const dbRefreshToken = await prismaService.refreshToken.findUnique({
        where: { token: testToken },
      });
      expect(dbRefreshToken).toBeNull();
    });
  });
});

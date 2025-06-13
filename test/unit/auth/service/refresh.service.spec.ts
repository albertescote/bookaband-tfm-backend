import { Test, TestingModule } from "@nestjs/testing";
import { RefreshTokenService } from "../../../../src/context/auth/service/refresh.service";
import { TokenService } from "../../../../src/context/auth/service/token.service";
import { RefreshTokensRepository } from "../../../../src/context/auth/infrastructure/refreshTokens.repository";
import { RefreshToken } from "../../../../src/context/auth/domain/refreshToken";
import { RefreshTokenNotFoundException } from "../../../../src/context/auth/exceptions/refreshTokenNotFoundException";
import { NotAbleToExecuteRefreshTokenDbTransactionException } from "../../../../src/context/auth/exceptions/notAbleToExecuteRefreshTokenDbTransactionException";
import { TokenPayload } from "../../../../src/context/auth/domain/tokenPayload";
import UserId from "../../../../src/context/shared/domain/userId";
import { Role } from "../../../../src/context/shared/domain/role";
import { ACCESS_TOKEN_EXPIRES_IN_SECONDS, TOKEN_ISSUER, TOKEN_TYPE } from "../../../../src/context/auth/config";

describe("RefreshTokenService", () => {
  let service: RefreshTokenService;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockRefreshTokensRepository: jest.Mocked<RefreshTokensRepository>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockTokenPayload: TokenPayload = {
    email: "test@example.com",
    sub: mockUserId,
    role: Role.Client,
  };

  const mockRefreshToken = "mock-refresh-token";
  const mockAccessToken = "mock-access-token";

  beforeEach(async () => {
    mockTokenService = {
      signToken: jest.fn().mockResolvedValue(mockAccessToken),
      verifyToken: jest.fn().mockResolvedValue(mockTokenPayload),
    } as any;

    mockRefreshTokensRepository = {
      findRefreshToken: jest.fn(),
      createRefreshToken: jest.fn(),
      deleteRefreshToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: RefreshTokensRepository,
          useValue: mockRefreshTokensRepository,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("refreshToken", () => {
    it("should return new access token when refresh token is valid", async () => {
      const mockStoredRefreshToken = RefreshToken.create(mockRefreshToken, new UserId(mockUserId));
      mockRefreshTokensRepository.findRefreshToken.mockResolvedValue(mockStoredRefreshToken);

      const result = await service.refreshToken(mockRefreshToken);

      expect(result).toEqual({
        access_token: mockAccessToken,
        token_type: TOKEN_TYPE,
        expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      });
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(mockRefreshToken);
      expect(mockTokenService.signToken).toHaveBeenCalledWith(
        mockTokenPayload,
        TOKEN_ISSUER,
        ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      );
    });

    it("should throw RefreshTokenNotFoundException when refresh token is not found", async () => {
      mockRefreshTokensRepository.findRefreshToken.mockResolvedValue(undefined);

      await expect(service.refreshToken(mockRefreshToken)).rejects.toThrow(
        RefreshTokenNotFoundException,
      );
    });
  });

  describe("createRefreshToken", () => {
    it("should create and return a new refresh token", async () => {
      const result = await service.createRefreshToken(mockTokenPayload, mockUserId);

      expect(result).toBe(mockAccessToken);
      expect(mockTokenService.signToken).toHaveBeenCalledWith(
        mockTokenPayload,
        TOKEN_ISSUER,
        expect.any(Number),
      );
      expect(mockRefreshTokensRepository.createRefreshToken).toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should delete refresh token when it exists", async () => {
      const mockStoredRefreshToken = RefreshToken.create(mockRefreshToken, new UserId(mockUserId));
      mockRefreshTokensRepository.findRefreshToken.mockResolvedValue(mockStoredRefreshToken);
      mockRefreshTokensRepository.deleteRefreshToken.mockResolvedValue(true);

      await service.logout(mockRefreshToken);

      expect(mockRefreshTokensRepository.deleteRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
    });

    it("should throw RefreshTokenNotFoundException when refresh token is not found", async () => {
      mockRefreshTokensRepository.findRefreshToken.mockResolvedValue(undefined);

      await expect(service.logout(mockRefreshToken)).rejects.toThrow(
        RefreshTokenNotFoundException,
      );
    });

    it("should throw NotAbleToExecuteRefreshTokenDbTransactionException when deletion fails", async () => {
      const mockStoredRefreshToken = RefreshToken.create(mockRefreshToken, new UserId(mockUserId));
      mockRefreshTokensRepository.findRefreshToken.mockResolvedValue(mockStoredRefreshToken);
      mockRefreshTokensRepository.deleteRefreshToken.mockResolvedValue(false);

      await expect(service.logout(mockRefreshToken)).rejects.toThrow(
        NotAbleToExecuteRefreshTokenDbTransactionException,
      );
    });
  });
}); 
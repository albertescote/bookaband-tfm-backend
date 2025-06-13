import { Test, TestingModule } from "@nestjs/testing";
import { TokenService } from "../../../../src/context/auth/service/token.service";
import { JoseWrapper } from "../../../../src/context/shared/infrastructure/joseWrapper";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { InvalidTokenException } from "../../../../src/context/auth/exceptions/invalidTokenException";
import { InvalidTokenSubjectException } from "../../../../src/context/auth/exceptions/invalidTokenSubjectException";
import { EmailNotVerifiedException } from "../../../../src/context/auth/exceptions/emailNotVerifiedException";
import { ResetPasswordSessionNotFoundException } from "../../../../src/context/auth/exceptions/resetPasswordSessionNotFoundException";
import { InvalidResetPasswordTokenException } from "../../../../src/context/auth/exceptions/invalidResetPasswordTokenException";
import { UserNotFoundException } from "../../../../src/context/auth/exceptions/userNotFoundException";
import { TokenPayload } from "../../../../src/context/auth/domain/tokenPayload";
import User from "../../../../src/context/shared/domain/user";
import UserId from "../../../../src/context/shared/domain/userId";
import { Role } from "../../../../src/context/shared/domain/role";
import { ResetPasswordSession } from "../../../../src/context/email/domain/resetPasswordSession";
import { Languages } from "../../../../src/context/shared/domain/languages";

describe("TokenService", () => {
  let service: TokenService;
  let mockJoseWrapper: jest.Mocked<JoseWrapper>;
  let mockModuleConnectors: jest.Mocked<ModuleConnectors>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockTokenPayload: TokenPayload = {
    email: "test@example.com",
    sub: mockUserId,
    role: Role.Client,
  };

  const mockToken = "mock-token";
  const mockSignedToken = "mock-signed-token";

  beforeEach(async () => {
    mockJoseWrapper = {
      signJwt: jest.fn().mockResolvedValue(mockSignedToken),
      verifyJwt: jest.fn().mockResolvedValue({
        valid: true,
        decodedPayload: mockTokenPayload,
      }),
    } as any;

    mockModuleConnectors = {
      obtainUserInformation: jest.fn(),
      getResetPasswordSession: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: "JoseWrapperInitialized",
          useValue: mockJoseWrapper,
        },
        {
          provide: ModuleConnectors,
          useValue: mockModuleConnectors,
        },
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("signToken", () => {
    it("should sign token with payload", async () => {
      const issuer = "test-issuer";
      const expiresIn = 3600;

      const result = await service.signToken(
        mockTokenPayload,
        issuer,
        expiresIn,
      );

      expect(result).toBe(mockSignedToken);
      expect(mockJoseWrapper.signJwt).toHaveBeenCalledWith(
        mockTokenPayload,
        issuer,
        expiresIn,
      );
    });
  });

  describe("verifyToken", () => {
    it("should verify token and return payload when valid", async () => {
      const mockUser = User.fromPrimitives({
        id: mockUserId,
        firstName: "John",
        familyName: "Doe",
        email: mockTokenPayload.email,
        role: mockTokenPayload.role,
        password: "encrypted-password",
        emailVerified: true,
        joinedDate: new Date().toISOString(),
      });
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(mockUser);

      const result = await service.verifyToken(mockToken);

      expect(result).toEqual(mockTokenPayload);
      expect(mockJoseWrapper.verifyJwt).toHaveBeenCalledWith(mockToken);
      expect(mockModuleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        mockTokenPayload.sub,
      );
    });

    it("should throw InvalidTokenException when token is invalid", async () => {
      mockJoseWrapper.verifyJwt.mockResolvedValue({
        valid: false,
        decodedPayload: null,
      });

      await expect(service.verifyToken(mockToken)).rejects.toThrow(
        InvalidTokenException,
      );
    });

    it("should throw InvalidTokenSubjectException when user is not found", async () => {
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(undefined);

      await expect(service.verifyToken(mockToken)).rejects.toThrow(
        InvalidTokenSubjectException,
      );
    });

    it("should throw EmailNotVerifiedException when user email is not verified", async () => {
      const mockUser = User.create(
        "John",
        "Doe",
        mockTokenPayload.email,
        Role.Client,
        "encrypted-password",
      );
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(mockUser);

      await expect(service.verifyToken(mockToken)).rejects.toThrow(
        EmailNotVerifiedException,
      );
    });
  });

  describe("verifyResetPasswordToken", () => {
    const mockSessionId = "mock-session-id";
    const mockResetPasswordTokenPayload = {
      ...mockTokenPayload,
      sessionId: mockSessionId,
    };

    beforeEach(() => {
      mockJoseWrapper.verifyJwt.mockResolvedValue({
        valid: true,
        decodedPayload: mockResetPasswordTokenPayload,
      });
    });

    it("should verify reset password token and return payload when valid", async () => {
      const mockResetPasswordSession = ResetPasswordSession.create(
        new UserId(mockUserId),
        Languages.ENGLISH,
      );
      const mockUser = User.fromPrimitives({
        id: mockUserId,
        firstName: "John",
        familyName: "Doe",
        email: mockTokenPayload.email,
        role: mockTokenPayload.role,
        password: "encrypted-password",
        emailVerified: true,
        joinedDate: new Date().toISOString(),
      });

      mockModuleConnectors.getResetPasswordSession.mockResolvedValue(
        mockResetPasswordSession.toPrimitives(),
      );
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(mockUser);

      const result = await service.verifyResetPasswordToken(mockToken);

      expect(result).toEqual({
        email: mockTokenPayload.email,
        sub: mockUserId,
        role: mockTokenPayload.role,
      });
      expect(mockJoseWrapper.verifyJwt).toHaveBeenCalledWith(mockToken);
      expect(mockModuleConnectors.getResetPasswordSession).toHaveBeenCalledWith(
        mockSessionId,
      );
      expect(mockModuleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        mockUserId,
      );
    });

    it("should throw InvalidTokenException when token is invalid", async () => {
      mockJoseWrapper.verifyJwt.mockResolvedValue({
        valid: false,
        decodedPayload: null,
      });

      await expect(service.verifyResetPasswordToken(mockToken)).rejects.toThrow(
        InvalidTokenException,
      );
    });

    it("should throw InvalidResetPasswordTokenException when sessionId is missing", async () => {
      mockJoseWrapper.verifyJwt.mockResolvedValue({
        valid: true,
        decodedPayload: mockTokenPayload,
      });

      await expect(service.verifyResetPasswordToken(mockToken)).rejects.toThrow(
        InvalidResetPasswordTokenException,
      );
    });

    it("should throw ResetPasswordSessionNotFoundException when session is not found", async () => {
      mockModuleConnectors.getResetPasswordSession.mockResolvedValue(undefined);

      await expect(service.verifyResetPasswordToken(mockToken)).rejects.toThrow(
        ResetPasswordSessionNotFoundException,
      );
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      const mockResetPasswordSession = ResetPasswordSession.create(
        new UserId(mockUserId),
        Languages.ENGLISH,
      );
      mockModuleConnectors.getResetPasswordSession.mockResolvedValue(
        mockResetPasswordSession.toPrimitives(),
      );
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(undefined);

      await expect(service.verifyResetPasswordToken(mockToken)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});

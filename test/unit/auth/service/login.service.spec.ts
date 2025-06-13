import { Test, TestingModule } from "@nestjs/testing";
import { LoginService } from "../../../../src/context/auth/service/login.service";
import { TokenService } from "../../../../src/context/auth/service/token.service";
import { RefreshTokenService } from "../../../../src/context/auth/service/refresh.service";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { GoogleAuthService } from "../../../../src/context/auth/infrastructure/googleAuthService";
import { Role } from "../../../../src/context/shared/domain/role";
import { GoogleEmailNotVerifiedException } from "../../../../src/context/auth/exceptions/googleEmailNotVerifiedException";
import { UserNotRegisteredYetException } from "../../../../src/context/auth/exceptions/userNotRegisteredYetException";
import { UserAlreadyRegisteredException } from "../../../../src/context/auth/exceptions/userAlreadyRegisteredException";
import User from "../../../../src/context/shared/domain/user";
import UserId from "../../../../src/context/shared/domain/userId";
import { JoseWrapper } from "../../../../src/context/shared/infrastructure/joseWrapper";
import { ACCESS_TOKEN_EXPIRES_IN_SECONDS } from "../../../../src/context/auth/config";

jest.mock("../../../../src/context/auth/infrastructure/googleAuthService");

describe("LoginService", () => {
  let service: LoginService;
  let mockTokenService: jest.Mocked<TokenService>;
  let mockRefreshTokenService: jest.Mocked<RefreshTokenService>;
  let mockModuleConnectors: jest.Mocked<ModuleConnectors>;
  let mockJoseWrapper: jest.Mocked<JoseWrapper>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockUser = {
    id: mockUserId,
    firstName: "John",
    familyName: "Doe",
    email: "john.doe@example.com",
    role: Role.Client,
  };

  const mockTokenPayload = {
    email: mockUser.email,
    sub: mockUser.id,
    role: mockUser.role,
  };

  const mockTokens = {
    access_token: "mock-access-token",
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    refresh_token: "mock-refresh-token",
    role: mockUser.role,
  };

  const mockEncryptedPassword = "encrypted-password-123";

  beforeEach(async () => {
    mockTokenService = {
      signToken: jest.fn().mockResolvedValue(mockTokens.access_token),
    } as any;

    mockRefreshTokenService = {
      createRefreshToken: jest.fn().mockResolvedValue(mockTokens.refresh_token),
    } as any;

    mockModuleConnectors = {
      obtainUserInformation: jest.fn(),
      createUserFromGoogle: jest.fn(),
    } as any;

    mockJoseWrapper = {
      signJwt: jest.fn(),
      verifyJwt: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
        {
          provide: ModuleConnectors,
          useValue: mockModuleConnectors,
        },
        {
          provide: "JoseWrapperInitialized",
          useValue: mockJoseWrapper,
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return tokens when login is successful", async () => {
      const result = await service.login(mockUser);

      expect(result).toEqual(mockTokens);
      expect(mockTokenService.signToken).toHaveBeenCalledWith(
        mockTokenPayload,
        expect.any(String),
        expect.any(Number),
      );
      expect(mockRefreshTokenService.createRefreshToken).toHaveBeenCalledWith(
        mockTokenPayload,
        mockUser.id,
      );
    });
  });

  describe("loginWithGoogle", () => {
    const mockCode = "mock-google-code";
    const mockGoogleTokenResponse = {
      tokens: {
        id_token: "mock-id-token",
      },
    };

    beforeEach(() => {
      (GoogleAuthService as jest.Mock).mockImplementation(() => ({
        exchangeCodeForToken: jest
          .fn()
          .mockResolvedValue(mockGoogleTokenResponse),
        getTokenPayload: jest.fn().mockReturnValue({
          email: mockUser.email,
          email_verified: true,
        }),
      }));
    });

    it("should return tokens when Google login is successful", async () => {
      const mockUserInstance = User.fromPrimitives({
        id: mockUser.id,
        firstName: mockUser.firstName,
        familyName: mockUser.familyName,
        email: mockUser.email,
        role: mockUser.role,
        password: mockEncryptedPassword,
        emailVerified: true,
        joinedDate: new Date().toISOString(),
      });
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(
        mockUserInstance,
      );

      const result = await service.loginWithGoogle(mockCode);

      expect(result).toEqual(mockTokens);
      expect(mockTokenService.signToken).toHaveBeenCalledWith(
        mockTokenPayload,
        expect.any(String),
        expect.any(Number),
      );
      expect(mockRefreshTokenService.createRefreshToken).toHaveBeenCalledWith(
        mockTokenPayload,
        mockUser.id,
      );
    });

    it("should throw GoogleEmailNotVerifiedException when email is not verified", async () => {
      (GoogleAuthService as jest.Mock).mockImplementation(() => ({
        exchangeCodeForToken: jest
          .fn()
          .mockResolvedValue(mockGoogleTokenResponse),
        getTokenPayload: jest.fn().mockReturnValue({
          email: mockUser.email,
          email_verified: false,
        }),
      }));

      await expect(service.loginWithGoogle(mockCode)).rejects.toThrow(
        GoogleEmailNotVerifiedException,
      );
    });

    it("should throw UserNotRegisteredYetException when user is not found", async () => {
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(undefined);

      await expect(service.loginWithGoogle(mockCode)).rejects.toThrow(
        UserNotRegisteredYetException,
      );
    });
  });

  describe("signUpWithGoogle", () => {
    const mockCode = "mock-google-code";
    const mockRole = Role.Client;
    const mockGoogleTokenResponse = {
      tokens: {
        id_token: "mock-id-token",
      },
    };

    beforeEach(() => {
      (GoogleAuthService as jest.Mock).mockImplementation(() => ({
        exchangeCodeForToken: jest
          .fn()
          .mockResolvedValue(mockGoogleTokenResponse),
        getTokenPayload: jest.fn().mockReturnValue({
          email: mockUser.email,
          email_verified: true,
          given_name: mockUser.firstName,
          family_name: mockUser.familyName,
          picture: "mock-picture-url",
        }),
      }));
    });

    it("should return tokens when Google signup is successful", async () => {
      const mockUserInstance = User.fromPrimitives({
        id: mockUser.id,
        firstName: mockUser.firstName,
        familyName: mockUser.familyName,
        email: mockUser.email,
        role: mockUser.role,
        password: mockEncryptedPassword,
        emailVerified: true,
        joinedDate: new Date().toISOString(),
      });
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(undefined);
      mockModuleConnectors.createUserFromGoogle.mockResolvedValue(
        mockUserInstance,
      );

      const result = await service.signUpWithGoogle(mockCode, mockRole);

      expect(result).toEqual(mockTokens);
      expect(mockTokenService.signToken).toHaveBeenCalledWith(
        mockTokenPayload,
        expect.any(String),
        expect.any(Number),
      );
      expect(mockRefreshTokenService.createRefreshToken).toHaveBeenCalledWith(
        mockTokenPayload,
        mockUser.id,
      );
    });

    it("should throw GoogleEmailNotVerifiedException when email is not verified", async () => {
      (GoogleAuthService as jest.Mock).mockImplementation(() => ({
        exchangeCodeForToken: jest
          .fn()
          .mockResolvedValue(mockGoogleTokenResponse),
        getTokenPayload: jest.fn().mockReturnValue({
          email: mockUser.email,
          email_verified: false,
        }),
      }));

      await expect(
        service.signUpWithGoogle(mockCode, mockRole),
      ).rejects.toThrow(GoogleEmailNotVerifiedException);
    });

    it("should throw UserAlreadyRegisteredException when user already exists", async () => {
      const mockUserInstance = User.create(
        mockUser.firstName,
        mockUser.familyName,
        mockUser.email,
        mockUser.role,
        mockEncryptedPassword,
      );
      mockModuleConnectors.obtainUserInformation.mockResolvedValue(
        mockUserInstance,
      );

      await expect(
        service.signUpWithGoogle(mockCode, mockRole),
      ).rejects.toThrow(UserAlreadyRegisteredException);
    });
  });
});

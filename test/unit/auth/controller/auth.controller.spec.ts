import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "../../../../src/app/api/auth/auth.controller";
import { LoginService } from "../../../../src/context/auth/service/login.service";
import { RefreshTokenService } from "../../../../src/context/auth/service/refresh.service";
import { UserInfoDtoPrimitives } from "../../../../src/context/auth/domain/userInfoDto";
import { LoginResponseDto } from "../../../../src/app/api/auth/loginResponse.dto";
import { RefreshTokenRequestDto } from "../../../../src/app/api/auth/refreshTokenRequest.dto";
import { RefreshTokenResponseDto } from "../../../../src/app/api/auth/refreshTokenResponse.dto";
import { LoginWithGoogleRequestDto } from "../../../../src/app/api/auth/loginWithGoogleRequest.dto";
import { SignUpWithGoogleRequestDto } from "../../../../src/app/api/auth/signUpWithGoogleRequest.dto";
import { Role } from "../../../../src/context/shared/domain/role";
import { Response } from "express";

describe("AuthController", () => {
  let controller: AuthController;

  const mockLoginService = {
    login: jest.fn(),
    loginWithGoogle: jest.fn(),
    signUpWithGoogle: jest.fn(),
  };

  const mockRefreshTokenService = {
    logout: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockUser: UserInfoDtoPrimitives = {
    id: "user-123",
    firstName: "John",
    familyName: "Doe",
    email: "test@example.com",
    role: Role.Client,
  };

  const mockResponse = {
    cookie: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginService,
          useValue: mockLoginService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("login", () => {
    it("should login user and set cookies", async () => {
      const expectedResponse: LoginResponseDto = {
        token_type: "Bearer",
        expires_in: 3600,
        role: Role.Client,
      };

      const mockLoginResponse = {
        ...expectedResponse,
        access_token: "access-token-123",
        refresh_token: "refresh-token-123",
      };

      mockLoginService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login({ user: mockUser }, mockResponse);

      expect(result).toEqual(expectedResponse);
      expect(mockLoginService.login).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "access_token",
        "access-token-123",
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refresh_token",
        "refresh-token-123",
        expect.any(Object),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "no-store",
      );
    });
  });

  describe("logout", () => {
    it("should logout user", async () => {
      const refreshTokenRequest: RefreshTokenRequestDto = {
        refreshToken: "refresh-token-123",
      };

      await controller.logout(refreshTokenRequest);

      expect(mockRefreshTokenService.logout).toHaveBeenCalledWith(
        refreshTokenRequest.refreshToken,
      );
    });
  });

  describe("refreshToken", () => {
    it("should refresh token and set new access token cookie", async () => {
      const refreshTokenRequest: RefreshTokenRequestDto = {
        refreshToken: "refresh-token-123",
      };

      const expectedResponse: RefreshTokenResponseDto = {
        token_type: "Bearer",
        expires_in: 3600,
      };

      const mockRefreshResponse = {
        ...expectedResponse,
        access_token: "new-access-token-123",
      };

      mockRefreshTokenService.refreshToken.mockResolvedValue(
        mockRefreshResponse,
      );

      const result = await controller.refreshToken(
        refreshTokenRequest,
        mockResponse,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockRefreshTokenService.refreshToken).toHaveBeenCalledWith(
        refreshTokenRequest.refreshToken,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "access_token",
        "new-access-token-123",
        expect.any(Object),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "no-store",
      );
    });
  });

  describe("loginWithGoogle", () => {
    it("should login user with Google and set cookies", async () => {
      const loginWithGoogleRequest: LoginWithGoogleRequestDto = {
        code: "google-auth-code-123",
      };

      const expectedResponse: LoginResponseDto = {
        token_type: "Bearer",
        expires_in: 3600,
        role: Role.Client,
      };

      const mockLoginResponse = {
        ...expectedResponse,
        access_token: "access-token-123",
        refresh_token: "refresh-token-123",
      };

      mockLoginService.loginWithGoogle.mockResolvedValue(mockLoginResponse);

      const result = await controller.loginWithGoogle(
        loginWithGoogleRequest,
        mockResponse,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockLoginService.loginWithGoogle).toHaveBeenCalledWith(
        loginWithGoogleRequest.code,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "access_token",
        "access-token-123",
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refresh_token",
        "refresh-token-123",
        expect.any(Object),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "no-store",
      );
    });
  });

  describe("signUpWithGoogle", () => {
    it("should sign up user with Google and set cookies", async () => {
      const signUpWithGoogleRequest: SignUpWithGoogleRequestDto = {
        code: "google-auth-code-123",
        role: Role.Client,
      };

      const expectedResponse: LoginResponseDto = {
        token_type: "Bearer",
        expires_in: 3600,
        role: Role.Client,
      };

      const mockLoginResponse = {
        ...expectedResponse,
        access_token: "access-token-123",
        refresh_token: "refresh-token-123",
      };

      mockLoginService.signUpWithGoogle.mockResolvedValue(mockLoginResponse);

      const result = await controller.signUpWithGoogle(
        signUpWithGoogleRequest,
        mockResponse,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockLoginService.signUpWithGoogle).toHaveBeenCalledWith(
        signUpWithGoogleRequest.code,
        signUpWithGoogleRequest.role,
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "access_token",
        "access-token-123",
        expect.any(Object),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refresh_token",
        "refresh-token-123",
        expect.any(Object),
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Cache-Control",
        "no-store",
      );
    });
  });
});

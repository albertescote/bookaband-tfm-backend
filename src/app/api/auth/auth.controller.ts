import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  Res,
  UseGuards,
} from "@nestjs/common";
import { LoginService } from "../../../context/auth/service/login.service";
import { LocalAuthGuard } from "../../../context/auth/guards/local-auth.guard";
import { UserInfoDtoPrimitives } from "../../../context/auth/domain/userInfoDto";
import { RefreshTokenRequestDto } from "./refreshTokenRequest.dto";
import { RefreshTokenResponseDto } from "./refreshTokenResponse.dto";
import { RefreshTokenService } from "../../../context/auth/service/refresh.service";
import { Response } from "express";
import { LoginResponseDto } from "./loginResponse.dto";
import { LoginWithGoogleRequestDto } from "./loginWithGoogleRequest.dto";

@Controller("/auth")
export class AuthController {
  constructor(
    private loginService: LoginService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("/login")
  @HttpCode(201)
  async login(
    @Request() req: { user: UserInfoDtoPrimitives },
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.loginService.login(req.user);
    response.cookie("access_token", loginResponse.access_token, {
      httpOnly: true,
      // TODO: put secure if https
      secure: false,
      sameSite: "strict",
    });
    response.cookie("refresh_token", loginResponse.refresh_token, {
      httpOnly: true,
      // TODO: put secure if https
      secure: false,
      sameSite: "strict",
    });
    response.setHeader("Cache-Control", "no-store");
    return {
      token_type: loginResponse.token_type,
      expires_in: loginResponse.expires_in,
    };
  }

  @Post("/logout")
  @HttpCode(200)
  async logout(@Body() body: RefreshTokenRequestDto): Promise<void> {
    return this.refreshTokenService.logout(body.refreshToken);
  }

  @Post("/refresh")
  @HttpCode(201)
  async refreshToken(
    @Body() refreshTokenRequest: RefreshTokenRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshTokenResponseDto> {
    const refreshTokenResponse = await this.refreshTokenService.refreshToken(
      refreshTokenRequest.refreshToken,
    );
    response.cookie("access_token", refreshTokenResponse.access_token, {
      httpOnly: true,
      // TODO: put secure if https
      secure: false,
      sameSite: "strict",
    });
    response.setHeader("Cache-Control", "no-store");
    return {
      token_type: refreshTokenResponse.token_type,
      expires_in: refreshTokenResponse.expires_in,
    };
  }

  @Post("/federation/google")
  @HttpCode(201)
  async loginWithGoogle(
    @Body() loginWithGoogleRequestDto: LoginWithGoogleRequestDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseDto> {
    const loginResponse = await this.loginService.loginWithGoogle(
      loginWithGoogleRequestDto.code,
    );
    response.cookie("access_token", loginResponse.access_token, {
      httpOnly: true,
      // TODO: put secure if https
      secure: false,
      sameSite: "strict",
    });
    response.cookie("refresh_token", loginResponse.refresh_token, {
      httpOnly: true,
      // TODO: put secure if https
      secure: false,
      sameSite: "strict",
    });
    response.setHeader("Cache-Control", "no-store");
    return {
      token_type: loginResponse.token_type,
      expires_in: loginResponse.expires_in,
    };
  }
}

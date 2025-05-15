import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UserResponseDto } from "./userResponse.dto";
import { UpdateUserRequestDto } from "./updateUserRequest.dto";
import { CreateUserRequestDto } from "./createUserRequest.dto";
import { UserService } from "../../../context/user/service/user.service";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { ResetPasswordRequestDto } from "./resetPassword.dto";
import { UpdatePasswordRequestDto } from "./updatePassword.dto";
import { JwtResetPasswordGuard } from "../../../context/auth/guards/jwt-reset-password.guard";
import { UserProfileDetailsResponseDto } from "./userProfileDetailsResponse.dto";

@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/")
  @HttpCode(201)
  async create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    return await this.userService.create(body);
  }

  @Get("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Request() req: { user: UserAuthInfo },
  ): Promise<UserResponseDto> {
    return this.userService.getById(req.user);
  }

  @Get("/profile")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getUserProfileDetails(
    @Request() req: { user: UserAuthInfo },
  ): Promise<UserProfileDetailsResponseDto> {
    return this.userService.getUserProfileDetails(req.user);
  }

  @Get("/all")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getAllUsers(
    @Request() req: { user: UserAuthInfo },
  ): Promise<UserResponseDto[]> {
    return this.userService.getAll(req.user);
  }

  @Put("/password")
  @UseGuards(JwtResetPasswordGuard)
  @HttpCode(200)
  async updatePasswordReset(
    @Request() req: { user: UserAuthInfo },
    @Body() updatePasswordRequestDto: UpdatePasswordRequestDto,
  ): Promise<void> {
    return this.userService.updatePassword(
      req.user,
      updatePasswordRequestDto.password,
    );
  }

  @Post("/password/reset")
  @HttpCode(201)
  async resetPassword(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto,
  ): Promise<void> {
    await this.userService.requestResetPassword(resetPasswordRequestDto);
  }

  @Put("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Body() body: UpdateUserRequestDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<UserResponseDto> {
    return this.userService.update(req.user, body);
  }

  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async delete(@Request() req: { user: UserAuthInfo }): Promise<void> {
    await this.userService.deleteById(req.user);
    return;
  }
}

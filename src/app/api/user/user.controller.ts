import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from "@nestjs/common";
import { UserResponseDto } from "./userResponse.dto";
import { UpdateUserRequestDto } from "./updateUserRequest.dto";
import { CreateUserRequestDto } from "./createUserRequest.dto";
import { UserService } from "../../../context/user/service/user.service";
import { IdParamDto } from "./idParam.dto";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";

@Controller("/user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/")
  @HttpCode(201)
  async create(@Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    return await this.userService.create(body);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<UserResponseDto> {
    return this.userService.getById(req.user, idParamDto.id);
  }

  @Get("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getAllUsers(
    @Request() req: { user: UserAuthInfo },
  ): Promise<UserResponseDto[]> {
    return this.userService.getAll(req.user);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Body() body: UpdateUserRequestDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<UserResponseDto> {
    return this.userService.update(req.user, idParamDto.id, body);
  }

  @Delete("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): Promise<void> {
    await this.userService.deleteById(req.user, idParamDto.id);
    return;
  }
}

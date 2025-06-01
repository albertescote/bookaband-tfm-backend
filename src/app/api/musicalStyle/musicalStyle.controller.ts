import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { CreateMusicalStyleRequestDto } from "./createMusicalStyle.dto";
import { MusicalStyleService } from "../../../context/musicalStyle/service/musicalStyle.service";
import { UpdateMusicalStyleRequestDto } from "./updateMusicalStyle.dto";
import { JwtAdminGuard } from "../../../context/auth/guards/jwt-admin.guard";

export interface MusicalStyleResponseDto {
  id: string;
  label: Record<string, string>;
  icon: string;
}

@Controller("/musical-styles")
export class MusicalStyleController {
  constructor(private readonly service: MusicalStyleService) {}

  @Post("/")
  @UseGuards(JwtAdminGuard)
  @HttpCode(201)
  async create(
    @Body() body: CreateMusicalStyleRequestDto,
  ): Promise<MusicalStyleResponseDto> {
    return this.service.create(body);
  }

  @Get("/")
  @HttpCode(200)
  async getAll(): Promise<MusicalStyleResponseDto[]> {
    return this.service.getAll();
  }

  @Get("/:id")
  @UseGuards(JwtAdminGuard)
  @HttpCode(200)
  async getById(@Param("id") id: string): Promise<MusicalStyleResponseDto> {
    return this.service.getById(id);
  }

  @Put("/:id")
  @UseGuards(JwtAdminGuard)
  @HttpCode(200)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateMusicalStyleRequestDto,
  ): Promise<MusicalStyleResponseDto> {
    return this.service.update({ ...body, id });
  }

  @Delete("/:id")
  @UseGuards(JwtAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string): Promise<void> {
    await this.service.delete(id);
  }
} 
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
import { CreateEventTypeRequestDto } from "./createEventType.dto";
import { EventTypeService } from "../../../context/eventType/service/eventType.service";
import { UpdateEventTypeRequestDto } from "./updateEventType.dto";
import { JwtAdminGuard } from "../../../context/auth/guards/jwt-admin.guard";

export interface EventTypeResponseDto {
  id: string;
  label: Record<string, string>;
  icon: string;
}

@Controller("/event-types")
export class EventTypeController {
  constructor(private readonly service: EventTypeService) {}

  @Post("/")
  @UseGuards(JwtAdminGuard)
  @HttpCode(201)
  async create(
    @Body() body: CreateEventTypeRequestDto,
  ): Promise<EventTypeResponseDto> {
    return this.service.create(body);
  }

  @Get("/")
  @HttpCode(200)
  async getAll(): Promise<EventTypeResponseDto[]> {
    return this.service.getAll();
  }

  @Get("/:id")
  @UseGuards(JwtAdminGuard)
  @HttpCode(200)
  async getById(@Param("id") id: string): Promise<EventTypeResponseDto> {
    return this.service.getById(id);
  }

  @Put("/:id")
  @UseGuards(JwtAdminGuard)
  @HttpCode(200)
  async update(
    @Param("id") id: string,
    @Body() body: UpdateEventTypeRequestDto,
  ): Promise<EventTypeResponseDto> {
    return this.service.update({ ...body, id });
  }

  @Delete("/:id")
  @UseGuards(JwtAdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string): Promise<void> {
    await this.service.delete(id);
  }
}

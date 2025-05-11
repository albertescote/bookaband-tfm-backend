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
} from "@nestjs/common";
import { CreateEventTypeRequestDto } from "./createEventType.dto";
import { EventTypeService } from "../../../context/eventType/service/eventType.service";
import { UpdateEventTypeRequestDto } from "./updateEventType.dto";

export interface EventTypeResponseDto {
  id: string;
  type: string;
}

@Controller("/event-types")
export class EventTypeController {
  constructor(private readonly service: EventTypeService) {}

  @Post()
  async create(
    @Body() body: CreateEventTypeRequestDto,
  ): Promise<EventTypeResponseDto> {
    return this.service.create(body);
  }

  @Get("/")
  async getAll(): Promise<EventTypeResponseDto[]> {
    return this.service.getAll();
  }

  @Get("/:id")
  async getById(@Param("id") id: string): Promise<EventTypeResponseDto> {
    return this.service.getById(id);
  }

  @Put("/:id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateEventTypeRequestDto,
  ): Promise<EventTypeResponseDto> {
    return this.service.update({ id, type: body.type });
  }

  @Delete("/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string): Promise<void> {
    await this.service.delete(id);
  }
}

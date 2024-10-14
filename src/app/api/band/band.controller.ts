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
import { BandResponseDto } from "./bandResponse.dto";
import { UpdateBandRequestDto } from "./updateBandRequest.dto";
import { CreateBandRequestDto } from "./createBandRequest.dto";
import { IdParamDto } from "./idParam.dto";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { BandService } from "../../../context/band/service/band.service";

@Controller("bands")
export class BandController {
  constructor(private readonly bandService: BandService) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateBandRequestDto,
  ): Promise<BandResponseDto> {
    return await this.bandService.create(body, req.user);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BandResponseDto> {
    return this.bandService.getById(idParamDto.id, req.user);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateBandRequestDto,
  ): Promise<BandResponseDto> {
    return await this.bandService.update(idParamDto.id, body, req.user);
  }

  @Delete("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): Promise<void> {
    await this.bandService.deleteById(idParamDto.id, req.user);
    return;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
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
import { GetUserBandsResponse } from "./getUserBandsResponse.dto";
import { BandWithDetailsResponseDto } from "./bandWithDetailsResponse.dto";
import { BandProfileResponseDto } from "./bandProfileResponse.dto";
import { JwtOptionalGuard } from "../../../context/auth/guards/jwt-optional.guard";
import { CommandBus } from "@nestjs/cqrs";
import { LeaveBandCommand } from "../../../context/band/service/leaveBand.command";
import { RemoveMemberCommand } from "../../../context/band/service/removeMember.command";

@Controller("bands")
export class BandController {
  constructor(
    private readonly bandService: BandService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateBandRequestDto,
  ): Promise<BandResponseDto> {
    return await this.bandService.create(req.user, body);
  }

  @Get("/:id/view")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getViewById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BandResponseDto> {
    return this.bandService.getViewById(req.user, idParamDto.id);
  }

  @Get("/:id/details")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getDetailsById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BandWithDetailsResponseDto> {
    return this.bandService.getDetailsById(req.user, idParamDto.id);
  }

  @Get("/:id/profile")
  @UseGuards(JwtOptionalGuard)
  @HttpCode(200)
  async getBandProfile(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BandProfileResponseDto> {
    return this.bandService.getBandProfile(req.user, idParamDto.id);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BandResponseDto> {
    return this.bandService.getById(req.user, idParamDto.id);
  }

  @Get("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getUserBands(
    @Request() req: { user: UserAuthInfo },
  ): Promise<GetUserBandsResponse[]> {
    return this.bandService.getUserBands(req.user);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateBandRequestDto,
  ): Promise<BandResponseDto> {
    return await this.bandService.update(req.user, idParamDto.id, body);
  }

  @Delete("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): Promise<void> {
    await this.bandService.deleteById(req.user, idParamDto.id);
    return;
  }

  @Post("/:id/leave")
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async leave(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new LeaveBandCommand(idParamDto.id, req.user.id),
    );
    return;
  }

  @Delete("/:id/members/:memberId")
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async removeMember(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) bandId: string,
    @Param("memberId", ParseUUIDPipe) memberId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new RemoveMemberCommand(bandId, req.user.id, memberId),
    );
    return;
  }
}

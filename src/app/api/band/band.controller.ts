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
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { BandResponseDto } from "./bandResponse.dto";
import { UpsertBandRequestDto } from "./upsertBandRequest.dto";
import { IdParamDto } from "./idParam.dto";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { BandService } from "../../../context/band/service/band.service";
import { GetUserBandsResponse } from "./getUserBandsResponse.dto";
import { BandProfileResponseDto } from "./bandProfileResponse.dto";
import { JwtOptionalGuard } from "../../../context/auth/guards/jwt-optional.guard";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { LeaveBandCommand } from "../../../context/band/service/leaveBand.command";
import { RemoveMemberCommand } from "../../../context/band/service/removeMember.command";
import { ParseIntPipeCustom } from "../../pipes/parse-int.pipe";
import { SanitizeTextPipe } from "../../pipes/sanitize-text.pipe";
import { ValidateLocationPipe } from "../../pipes/validate-location.pipe";
import { ValidateSearchQueryPipe } from "../../pipes/validate-serch-query.pipe";
import { ValidateDatePipe } from "../../pipes/validate-date.pipe";
import { FilteredBandsResponseDto } from "./filteredBandsResponse.dto";
import { FeaturedBandsResponseDto } from "./featuredBandsResponse.dto";
import { GetFilteredBandsQuery } from "../../../context/band/service/getFilteredBands.query";
import { GetFeaturedBandsQuery } from "../../../context/band/service/getFeaturedBands.query";
import { GetBandProfileQuery } from "../../../context/band/service/getBandProfile.query";

@Controller("bands")
export class BandController {
  constructor(
    private readonly bandService: BandService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpsertBandRequestDto,
  ): Promise<void> {
    return await this.bandService.create(req.user, body);
  }

  @Get("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getUserBands(
    @Request() req: { user: UserAuthInfo },
  ): Promise<GetUserBandsResponse[]> {
    return this.bandService.getUserBands(req.user);
  }

  @Get("/details")
  @UseGuards(JwtOptionalGuard)
  @HttpCode(200)
  async getFilteredBands(
    @Request() req: { user: UserAuthInfo },
    @Query("page", ParseIntPipeCustom) page = 1,
    @Query("pageSize", ParseIntPipeCustom) pageSize = 10,
    @Query("location", new SanitizeTextPipe(), new ValidateLocationPipe())
    location?: string,
    @Query("searchQuery", new SanitizeTextPipe(), new ValidateSearchQueryPipe())
    searchQuery?: string,
    @Query("date", new SanitizeTextPipe(), new ValidateDatePipe())
    date?: string,
  ): Promise<FilteredBandsResponseDto> {
    const query = new GetFilteredBandsQuery(req.user.id, page, pageSize, {
      location,
      searchQuery,
      date,
    });
    return this.queryBus.execute(query);
  }

  @Get("/featured")
  @UseGuards(JwtOptionalGuard)
  @HttpCode(200)
  async getFeaturedBands(
    @Request() req: { user: UserAuthInfo },
    @Query("page", ParseIntPipeCustom) page = 1,
    @Query("pageSize", ParseIntPipeCustom) pageSize = 10,
  ): Promise<FeaturedBandsResponseDto> {
    const query = new GetFeaturedBandsQuery(req.user.id, page, pageSize);
    return this.queryBus.execute(query);
  }

  @Get("/:id/profile")
  @UseGuards(JwtOptionalGuard)
  @HttpCode(200)
  async getBandProfile(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BandProfileResponseDto> {
    const query = new GetBandProfileQuery(req.user.id, idParamDto.id);
    return this.queryBus.execute(query);
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

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpsertBandRequestDto,
  ): Promise<void> {
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

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { OfferService } from "../../../context/offer/service/offer.service";
import { OfferRequestDto } from "./offerRequest.dto";
import { OfferResponseDto } from "./offerResponse.dto";
import { IdParamDto } from "./idParam.dto";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { OfferDetailsResponseDto } from "./offerDetailsResponse.dto";
import { JwtOptionalGuard } from "../../../context/auth/guards/jwt-optional.guard";
import { OfferOverviewResponseDto } from "./offerOverviewResponse.dto";
import { ParseIntPipeCustom } from "../../pipes/parse-int.pipe";
import { SanitizeTextPipe } from "../../pipes/sanitize-text.pipe";
import { ValidateLocationPipe } from "../../pipes/validate-location.pipe";
import { ValidateSearchQueryPipe } from "../../pipes/validate-serch-query.pipe";
import { ValidateDatePipe } from "../../pipes/validate-date.pipe";
import { OfferFilteredDetailsResponseDto } from "./offerFilteredDetailsResponse.dto";

@Controller("offers")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get("/details")
  @UseGuards(JwtOptionalGuard)
  @HttpCode(200)
  async getFilteredOffersDetails(
    @Request() req: { user: UserAuthInfo },
    @Query("page", ParseIntPipeCustom) page = 1,
    @Query("pageSize", ParseIntPipeCustom) pageSize = 10,
    @Query("location", new SanitizeTextPipe(), new ValidateLocationPipe())
    location?: string,
    @Query("searchQuery", new SanitizeTextPipe(), new ValidateSearchQueryPipe())
    searchQuery?: string,
    @Query("date", new SanitizeTextPipe(), new ValidateDatePipe())
    date?: string,
  ): Promise<OfferFilteredDetailsResponseDto> {
    return this.offerService.getFilteredOffersDetails(
      req.user.id,
      page,
      pageSize,
      {
        location,
        searchQuery,
        date,
      },
    );
  }

  @Get("/featured")
  @UseGuards(JwtOptionalGuard)
  @HttpCode(200)
  async getFeaturedOffers(
    @Request() req: { user: UserAuthInfo },
    @Query("page", ParseIntPipeCustom) page = 1,
    @Query("pageSize", ParseIntPipeCustom) pageSize = 10,
  ): Promise<OfferOverviewResponseDto> {
    return this.offerService.getFeatured(req.user.id, page, pageSize);
  }

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: OfferRequestDto,
  ): Promise<OfferResponseDto> {
    return await this.offerService.create(req.user, body);
  }

  @Get("/:id/details")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getOfferDetails(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<OfferDetailsResponseDto> {
    return this.offerService.getOfferDetails(req.user, idParamDto.id);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<OfferResponseDto> {
    return this.offerService.getById(req.user, idParamDto.id);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
    @Body() body: OfferRequestDto,
  ): Promise<OfferResponseDto> {
    return await this.offerService.update(req.user, idParamDto.id, body);
  }

  @Delete("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): Promise<void> {
    await this.offerService.deleteById(req.user, idParamDto.id);
    return;
  }
}

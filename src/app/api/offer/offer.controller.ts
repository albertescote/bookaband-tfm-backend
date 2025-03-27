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
import { OfferService } from "../../../context/offer/service/offer.service";
import { OfferRequestDto } from "./offerRequest.dto";
import { OfferResponseDto } from "./offerResponse.dto";
import { IdParamDto } from "./idParam.dto";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { OfferDetailsResponseDto } from "./offerDetailsResponse.dto";

@Controller("offers")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: OfferRequestDto,
  ): Promise<OfferResponseDto> {
    return await this.offerService.create(req.user, body);
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

  @Get("/:id/details")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getOfferDetails(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<OfferDetailsResponseDto> {
    return this.offerService.getOfferDetails(req.user, idParamDto.id);
  }

  @Get("/")
  @HttpCode(200)
  async getAllOffers(): Promise<OfferDetailsResponseDto[]> {
    return this.offerService.getAll();
  }
}

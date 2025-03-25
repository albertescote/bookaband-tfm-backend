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
import { UpdateOfferRequestDto } from "./updateOfferRequest.dto";
import { CreateOfferRequestDto } from "./createOfferRequest.dto";
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
    @Body() body: CreateOfferRequestDto,
  ): Promise<OfferResponseDto> {
    return await this.offerService.create(body, req.user);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<OfferResponseDto> {
    return this.offerService.getById(idParamDto.id, req.user);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateOfferRequestDto,
  ): Promise<OfferResponseDto> {
    return await this.offerService.update(idParamDto.id, body, req.user);
  }

  @Delete("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(204)
  async delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): Promise<void> {
    await this.offerService.deleteById(idParamDto.id, req.user);
    return;
  }

  @Get("/:id/details")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getOfferDetails(
    @Param() idParamDto: IdParamDto,
  ): Promise<OfferDetailsResponseDto> {
    return this.offerService.getOfferDetails(idParamDto.id);
  }

  @Get("/")
  @HttpCode(200)
  async getAllOffers(): Promise<OfferDetailsResponseDto[]> {
    return this.offerService.getAll();
  }
}

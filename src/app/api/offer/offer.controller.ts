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
import { CreateOfferResponseDto } from "./createOfferResponse.dto";
import { UpdateOfferRequestDto } from "./updateOfferRequest.dto";
import { CreateOfferRequestDto } from "./createOfferRequest.dto";
import { OfferResponseDto } from "./offerResponse.dto";
import { IdParamDto } from "./idParam.dto";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";

@Controller("offer")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateOfferRequestDto,
  ): Promise<CreateOfferResponseDto> {
    return await this.offerService.create(body, req.user);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  getById(
    @Param() idParamDto: IdParamDto,
    @Request() req: { user: UserAuthInfo },
  ): OfferResponseDto {
    return this.offerService.getById(idParamDto.id, req.user);
  }

  @Get("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  getAll(): OfferResponseDto[] {
    return this.offerService.getAll();
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
  delete(
    @Request() req: { user: UserAuthInfo },
    @Param() idParamDto: IdParamDto,
  ): void {
    this.offerService.deleteById(idParamDto.id, req.user);
    return;
  }
}

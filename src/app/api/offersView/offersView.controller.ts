import { Controller, Get, HttpCode, Param, UseGuards } from "@nestjs/common";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { OffersViewResponseDto } from "./offersViewResponse.dto";
import { IdParamDto } from "./idParam.dto";
import { OffersViewService } from "../../../context/offer/service/offersView.service";

@Controller("offers-view")
export class OffersViewController {
  constructor(private readonly offersViewService: OffersViewService) {}

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param() idParamDto: IdParamDto,
  ): Promise<OffersViewResponseDto> {
    return this.offersViewService.getById(idParamDto.id);
  }

  @Get("/")
  @HttpCode(200)
  async getAll(): Promise<OffersViewResponseDto[]> {
    return this.offersViewService.getAll();
  }
}

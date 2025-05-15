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
import { BillingAddressService } from "../../../context/billingAddress/service/billingAddress.service";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { CreateBillingAddressRequestDto } from "./createBillingAddressRequest.dto";
import { UpdateBillingAddressRequestDto } from "./updateBillingAddressRequest.dto";

interface BillingAddressResponseDto {
  id: string;
  userId: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  addressLine2?: string;
}

@Controller("/billing-address")
export class BillingAddressController {
  constructor(private readonly service: BillingAddressService) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateBillingAddressRequestDto,
  ): Promise<BillingAddressResponseDto> {
    return this.service.create(req.user, body);
  }

  @Get("/user/:userId")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findByUserId(
    @Request() req: { user: UserAuthInfo },
    @Param("userId", ParseUUIDPipe) userId: string,
  ): Promise<BillingAddressResponseDto> {
    return this.service.findByUserId(req.user, userId);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findById(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<BillingAddressResponseDto> {
    return this.service.findById(req.user, id);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateBillingAddressRequestDto,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<BillingAddressResponseDto> {
    return this.service.update(req.user, { ...body, id });
  }

  @Delete("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async delete(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.service.delete(req.user, id);
  }
}

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
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { PaymentMethodService } from "../../../context/paymentMethod/service/paymentMethod.service";
import { CreatePaymentMethodRequestDto } from "./createPaymentMethodRequest.dto";
import { UpdatePaymentMethodRequestDto } from "./updatePaymentMethodRequest.dto";

interface PaymentMethodResponseDto {
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  type: string;
  lastFour: string;
  isDefault: boolean;
  createdAt: Date;
  brand?: string;
  alias?: string;
}

@Controller("/payment-method")
export class PaymentMethodController {
  constructor(private readonly service: PaymentMethodService) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreatePaymentMethodRequestDto,
  ): Promise<PaymentMethodResponseDto> {
    return this.service.create(req.user, body);
  }

  @Get("/user/:userId")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findByUserId(
    @Request() req: { user: UserAuthInfo },
    @Param("userId", ParseUUIDPipe) userId: string,
  ): Promise<PaymentMethodResponseDto[]> {
    return this.service.findByUserId(req.user, userId);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findById(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PaymentMethodResponseDto> {
    return this.service.findById(req.user, id);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdatePaymentMethodRequestDto,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<PaymentMethodResponseDto> {
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

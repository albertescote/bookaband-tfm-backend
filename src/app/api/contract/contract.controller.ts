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
import { ContractService } from "../../../context/contract/service/contract.service";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { UpdateContractRequestDto } from "./updateContractRequest.dto";
import { SignatureNotificationRequestDto } from "./signatureNotificationRequest.dto";

interface ContractResponseDto {
  id: string;
  bookingId: string;
  status: string;
  fileUrl: string;
  userSigned: boolean;
  bandSigned: boolean;
  createdAt: Date;
  updatedAt: Date;
  eventName?: string;
  bandName?: string;
  userName?: string;
  eventDate?: Date;
}

@Controller("/contracts")
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @Get("/user")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findAllByUser(
    @Request() req: { user: UserAuthInfo },
  ): Promise<ContractResponseDto[]> {
    return this.service.findManyByUserId(req.user);
  }

  @Get("/band/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findAllByBand(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ContractResponseDto[]> {
    return this.service.findManyByBand(req.user, id);
  }

  @Post("/notifications/signerstatus/:id")
  @HttpCode(200)
  async processNotification(
    @Body() body: SignatureNotificationRequestDto,
    @Param("id") id: string,
  ): Promise<void> {
    return this.service.processSignatureNotification(body);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findById(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ContractResponseDto> {
    return this.service.findById(req.user, id);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateContractRequestDto,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<ContractResponseDto> {
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

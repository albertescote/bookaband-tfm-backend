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
import { CreateContractRequestDto } from "./createContractRequest.dto";
import { UpdateContractRequestDto } from "./updateContractRequest.dto";

interface ContractResponseDto {
  id: string;
  bookingId: string;
  date: Date;
  status: string;
}

@Controller("/contracts")
export class ContractController {
  constructor(private readonly service: ContractService) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateContractRequestDto,
  ): Promise<ContractResponseDto> {
    return this.service.create(req.user, body);
  }

  @Get("/user")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findAllByUser(
    @Request() req: { user: UserAuthInfo },
  ): Promise<ContractResponseDto[]> {
    return this.service.findManyByUserId(req.user);
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

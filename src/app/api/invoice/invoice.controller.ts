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
import { InvoiceService } from "../../../context/invoice/service/invoice.service";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { UpdateInvoiceRequestDto } from "./updateInvoiceRequest.dto";
import { CreateInvoiceRequestDto } from "./createInvoiceRequest.dto";
import { CommandBus } from "@nestjs/cqrs";
import { PayInvoiceCommand } from "../../../context/invoice/service/payInvoice.command";

interface InvoiceResponseDto {
  id: string;
  contractId: string;
  amount: number;
  status: string;
  fileUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

@Controller("/invoices")
export class InvoiceController {
  constructor(
    private readonly service: InvoiceService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async create(
    @Request() req: { user: UserAuthInfo },
    @Body() body: CreateInvoiceRequestDto,
  ): Promise<InvoiceResponseDto> {
    return this.service.create(req.user, body);
  }

  @Get("/user")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findAllByUser(
    @Request() req: { user: UserAuthInfo },
  ): Promise<InvoiceResponseDto[]> {
    return this.service.findManyByUserId(req.user);
  }

  @Get("/band/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findAllByBand(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<InvoiceResponseDto[]> {
    return this.service.findManyByBand(req.user, id);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async findById(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<InvoiceResponseDto> {
    return this.service.findById(req.user, id);
  }

  @Put("/:id/payment")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async payInvoice(
    @Request() req: { user: UserAuthInfo },
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<void> {
    const payInvoiceCommand = new PayInvoiceCommand(id, req.user);
    await this.commandBus.execute(payInvoiceCommand);
  }

  @Put("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async update(
    @Request() req: { user: UserAuthInfo },
    @Body() body: UpdateInvoiceRequestDto,
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<InvoiceResponseDto> {
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

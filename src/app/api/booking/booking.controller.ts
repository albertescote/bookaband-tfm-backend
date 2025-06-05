import {
  Body,
  Controller,
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
import { CreateBookingRequestDto } from "./createBookingRequest.dto";
import { BookingService } from "../../../context/booking/service/booking.service";
import { BookingResponseDto } from "./bookingResponse.dto";
import { BookingResponseWithDetailsDto } from "./bookingResponseWithDetails.dto";

@Controller("/bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async createBooking(
    @Body() body: CreateBookingRequestDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseDto> {
    return await this.bookingService.create(req.user, body);
  }

  @Get("/client")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getAllFromClient(
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseWithDetailsDto[]> {
    return await this.bookingService.getAllFromClient(req.user);
  }

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseWithDetailsDto> {
    return await this.bookingService.getById(req.user, id);
  }

  @Get("/band/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getAllFromBand(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseWithDetailsDto[]> {
    return await this.bookingService.getAllFromBand(req.user, id);
  }

  @Put("/:id/accept")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async acceptBooking(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseDto> {
    return await this.bookingService.acceptBooking(req.user, id);
  }

  @Put("/:id/decline")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async declineBooking(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseDto> {
    return await this.bookingService.declineBooking(req.user, id);
  }

  @Put("/:id/cancel")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async cancelBooking(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseDto> {
    return await this.bookingService.cancelBooking(req.user, id);
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { CreateBookingRequestDto } from "./createBookingRequest.dto";
import { BookingService } from "../../../context/booking/service/booking.service";
import { BookingResponseDto } from "./bookingResponse.dto";

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

  @Get("/:id")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getById(
    @Param("id", ParseUUIDPipe) id: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<BookingResponseDto> {
    return await this.bookingService.getById(req.user, id);
  }
}

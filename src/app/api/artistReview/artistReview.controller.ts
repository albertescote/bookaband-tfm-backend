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
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateArtistReviewCommand } from "../../../context/artistReview/service/createArtistReview.command";
import { CreateArtistReviewRequestDto } from "./createArtistReviewRequest.dto";
import { ArtistReviewPrimitives } from "../../../context/artistReview/domain/artistReview";
import { GetReviewByBookingIdQuery } from "../../../context/artistReview/service/getReviewByBookingId.query";

@Controller("/reviews")
export class ArtistReviewController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post("/")
  @UseGuards(JwtCustomGuard)
  @HttpCode(201)
  async createArtistReview(
    @Body() body: CreateArtistReviewRequestDto,
    @Request() req: { user: UserAuthInfo },
  ): Promise<void> {
    const command = new CreateArtistReviewCommand(
      body.bookingId,
      body.rating,
      body.comment,
      req.user,
    );
    await this.commandBus.execute(command);
  }

  @Get("/booking/:bookingId")
  @UseGuards(JwtCustomGuard)
  @HttpCode(200)
  async getReviewByBookingId(
    @Param("bookingId", ParseUUIDPipe) bookingId: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<ArtistReviewPrimitives | null> {
    const query = new GetReviewByBookingIdQuery(bookingId, req.user);
    const review = await this.queryBus.execute(query);
    return review || null;
  }
}

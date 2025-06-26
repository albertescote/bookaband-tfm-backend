import {
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { UserAuthInfo } from "../../../context/shared/domain/userAuthInfo";
import { CommandBus } from "@nestjs/cqrs";
import { CreateArtistReviewCommand } from "../../../context/artistReview/service/createArtistReview.command";
import { CreateArtistReviewRequestDto } from "./createArtistReviewRequest.dto";

@Controller("/reviews")
export class ArtistReviewController {
  constructor(private readonly commandBus: CommandBus) {}

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
}

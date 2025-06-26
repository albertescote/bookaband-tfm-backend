import { IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateArtistReviewRequestDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsNumber()
  rating: number;

  @IsNotEmpty()
  @IsString()
  comment: string;
}

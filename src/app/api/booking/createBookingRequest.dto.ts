import { IsNotEmpty, IsUUID } from "class-validator";
import { IsStringDate } from "../../validators/isStringDateConstraint";

export class CreateBookingRequestDto {
  @IsNotEmpty()
  @IsUUID()
  offerId: string;

  @IsNotEmpty()
  @IsStringDate()
  date: string;
}

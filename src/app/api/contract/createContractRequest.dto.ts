import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateContractRequestDto {
  @IsNotEmpty()
  @IsUUID()
  bookingId: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;
}

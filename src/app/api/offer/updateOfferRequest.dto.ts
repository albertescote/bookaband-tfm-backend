import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateOfferRequestDto {
  @IsNotEmpty()
  @IsString()
  topic: string;

  @IsNotEmpty()
  @IsUUID()
  studentId: string;
}

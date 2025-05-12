import { IsNotEmpty, IsString } from "class-validator";

export class CreateEventTypeRequestDto {
  @IsNotEmpty()
  label: Record<string, string>;

  @IsNotEmpty()
  @IsString()
  icon: string;
}

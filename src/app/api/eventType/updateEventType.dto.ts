import { IsNotEmpty, IsString } from "class-validator";

export class UpdateEventTypeRequestDto {
  @IsNotEmpty()
  label: Record<string, string>;

  @IsNotEmpty()
  @IsString()
  icon: string;
}

import { IsNotEmpty, IsString } from "class-validator";

export class CreateMusicalStyleRequestDto {
  @IsNotEmpty()
  label: Record<string, string>;

  @IsNotEmpty()
  @IsString()
  icon: string;
}

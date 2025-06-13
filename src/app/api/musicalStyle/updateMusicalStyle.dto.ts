import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class UpdateMusicalStyleRequestDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsNotEmpty()
  label: Record<string, string>;

  @IsNotEmpty()
  @IsString()
  icon: string;
}

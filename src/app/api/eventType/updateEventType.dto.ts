import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { EventTypeName } from "../../../context/shared/domain/eventType";

export class UpdateEventTypeRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(EventTypeName)
  type: string;
}

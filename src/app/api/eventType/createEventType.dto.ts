import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { EventTypeName } from "../../../context/shared/domain/eventType";

export class CreateEventTypeRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(EventTypeName)
  type: EventTypeName;
}

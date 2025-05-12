import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ValidateLocationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== "string") return undefined;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const locationRegex = /^[a-zA-Z0-9\s\-.,()]+$/;

    if (!locationRegex.test(trimmed)) {
      throw new BadRequestException("Invalid location format.");
    }

    return trimmed;
  }
}

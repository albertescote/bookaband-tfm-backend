import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ValidateDatePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== "string") return undefined;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (!dateRegex.test(trimmed)) {
      throw new BadRequestException("Invalid date format. Use YYYY-MM-DD.");
    }

    const date = new Date(trimmed);
    if (isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date.");
    }

    return trimmed;
  }
}

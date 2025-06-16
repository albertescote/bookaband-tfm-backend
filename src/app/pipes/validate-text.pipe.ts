import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ValidateTextPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== "string") return undefined;

    const decoded = decodeURIComponent(value);

    const trimmed = decoded.trim();
    if (!trimmed) return undefined;

    const artistNameRegex = /^[\p{L}\p{N}\s\-.,()&!'+#@\/:"]+$/u;

    if (!artistNameRegex.test(trimmed)) {
      throw new BadRequestException("Invalid search query format.");
    }

    return trimmed;
  }
}

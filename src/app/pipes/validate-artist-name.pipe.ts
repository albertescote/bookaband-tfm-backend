import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ValidateArtistNamePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (typeof value !== "string") return undefined;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const searchRegex = /^[a-zA-Z0-9\s\-.,()&!'+#@\/:"]+$/;

    if (!searchRegex.test(trimmed)) {
      throw new BadRequestException("Invalid search query format.");
    }

    return trimmed;
  }
}

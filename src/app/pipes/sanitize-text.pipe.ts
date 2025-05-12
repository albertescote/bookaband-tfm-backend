import { Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class SanitizeTextPipe
  implements PipeTransform<string | undefined, string | undefined>
{
  transform(value?: string): string | undefined {
    if (typeof value !== "string") return undefined;

    const trimmed = value.trim();
    if (!trimmed) return undefined;

    return trimmed
      .replace(/[<>]/g, "")
      .replace(/[&]/g, "")
      .replace(/[;]/g, "")
      .replace(/['"]/g, "");
  }
}

import { InvalidEventTypeLabelException } from "../exceptions/invalidEventTypeLabelException";

export class EventTypeLabel {
  private readonly value: Record<string, string>;

  constructor(value: Record<string, string>) {
    if (!value || Object.keys(value).length === 0) {
      throw new InvalidEventTypeLabelException(
        "EventTypeLabel cannot be empty.",
      );
    }

    for (const [lang, text] of Object.entries(value)) {
      if (!lang.match(/^[a-z]{2}$/)) {
        throw new InvalidEventTypeLabelException(
          `invalid language code "${lang}" in EventTypeLabel.`,
        );
      }
      if (typeof text !== "string" || text.trim().length === 0) {
        throw new InvalidEventTypeLabelException(
          `empty label for language "${lang}" in EventTypeLabel.`,
        );
      }
    }

    this.value = Object.freeze({ ...value });
  }

  public getAll(): Record<string, string> {
    return this.value;
  }

  public getFor(locale: string, fallback: string = "en"): string {
    return (
      this.value[locale] || this.value[fallback] || Object.values(this.value)[0]
    );
  }

  public toPrimitives(): Record<string, string> {
    return this.value;
  }
}

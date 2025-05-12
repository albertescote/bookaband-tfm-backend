export class EventTypeIcon {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("EventTypeIcon cannot be empty.");
    }

    const EMOJI_REGEX = /\p{Emoji}/u;
    if (!EMOJI_REGEX.test(value)) {
      throw new Error(
        `Invalid EventTypeIcon. Must be a valid emoji. Got: "${value}"`,
      );
    }

    this.value = value;
  }

  public get(): string {
    return this.value;
  }

  public toPrimitives(): string {
    return this.value;
  }
}

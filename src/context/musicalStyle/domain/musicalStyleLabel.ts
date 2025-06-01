export class MusicalStyleLabel {
  constructor(private readonly value: Record<string, string>) {}

  toPrimitives(): Record<string, string> {
    return this.value;
  }
} 
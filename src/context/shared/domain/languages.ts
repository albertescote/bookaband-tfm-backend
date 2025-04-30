import { InvalidLanguageException } from "../exceptions/invalidLanguageException";

export enum Languages {
  CATALAN = "ca",
  ENGLISH = "en",
  SPANISH = "es",
}

export class Language {
  constructor(private language: Languages) {}

  static fromString(language: string): Language {
    const langEntry = Object.values(Languages).find(
      (value) => value === language,
    );
    if (!langEntry) {
      throw new InvalidLanguageException(language);
    }
    return new Language(langEntry);
  }

  toPrimitive(): Languages {
    return this.language;
  }
}

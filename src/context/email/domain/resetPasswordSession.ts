import UserId from "../../shared/domain/userId";
import SessionId from "./sessionId";
import { Language, Languages } from "../../shared/domain/languages";

const EXPIRATION_SECONDS = 1800;

export interface ResetPasswordSessionPrimitives {
  id: string;
  userId: string;
  expiresAt: string;
  language: string;
}

export class ResetPasswordSession {
  private constructor(
    private readonly id: SessionId,
    private readonly userId: UserId,
    private readonly expiresAt: Date,
    private readonly language: Language,
  ) {}

  static create(
    userId: UserId,
    language: Languages = Languages.ENGLISH,
  ): ResetPasswordSession {
    const expiresAt = new Date(Date.now() + EXPIRATION_SECONDS * 1000);
    return new ResetPasswordSession(
      SessionId.generate(),
      userId,
      expiresAt,
      Language.fromString(language),
    );
  }

  static fromPrimitives(
    data: ResetPasswordSessionPrimitives,
  ): ResetPasswordSession {
    return new ResetPasswordSession(
      new SessionId(data.id),
      new UserId(data.userId),
      new Date(data.expiresAt),
      Language.fromString(data.language),
    );
  }

  toPrimitives(): ResetPasswordSessionPrimitives {
    return {
      id: this.id.toPrimitive(),
      userId: this.userId.toPrimitive(),
      expiresAt: this.expiresAt.toISOString(),
      language: this.language.toPrimitive(),
    };
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  getSessionId(): SessionId {
    return this.id;
  }
}

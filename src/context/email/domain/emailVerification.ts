import UserId from "../../shared/domain/userId";
import EmailVerificationId from "./emailVerificationId";
import { Language, Languages } from "../../shared/domain/languages";
import { EmailVerificationRateLimitExceededException } from "../exceptions/emailVerificationRateLimitExceededException";

const EMAIL_VERIFICATION_RATE_LIMIT_SECONDS = 30;

export interface EmailVerificationPrimitives {
  id: string;
  userId: string;
  language: string;
  email: string;
  verified: boolean;
  lastEmailSentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class EmailVerification {
  constructor(
    private readonly id: EmailVerificationId,
    private readonly userId: UserId,
    private readonly language: Language,
    private email: string,
    private verified: boolean,
    private lastEmailSentAt: Date,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static create(
    userId: UserId,
    language: Languages,
    email: string,
  ): EmailVerification {
    const now = new Date();
    return new EmailVerification(
      EmailVerificationId.generate(),
      userId,
      Language.fromString(language),
      email,
      false,
      now,
      now,
      now,
    );
  }

  static fromPrimitives(
    primitives: EmailVerificationPrimitives,
  ): EmailVerification {
    return new EmailVerification(
      new EmailVerificationId(primitives.id),
      new UserId(primitives.userId),
      Language.fromString(primitives.language),
      primitives.email,
      primitives.verified,
      primitives.lastEmailSentAt,
      primitives.createdAt,
      primitives.updatedAt,
    );
  }

  toPrimitives(): EmailVerificationPrimitives {
    return {
      id: this.id.toPrimitive(),
      userId: this.userId.toPrimitive(),
      language: this.language.toPrimitive(),
      email: this.email,
      verified: this.verified,
      lastEmailSentAt: this.lastEmailSentAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  verifyEmail() {
    this.verified = true;
  }

  getId(): EmailVerificationId {
    return this.id;
  }

  updateLastEmailSentAt() {
    const now = new Date();
    const secondsSinceLastSent =
      (now.getTime() - this.lastEmailSentAt.getTime()) / 1000;
    if (secondsSinceLastSent < EMAIL_VERIFICATION_RATE_LIMIT_SECONDS) {
      throw new EmailVerificationRateLimitExceededException();
    }
  }

  getLanguage(): Language {
    return this.language;
  }
}

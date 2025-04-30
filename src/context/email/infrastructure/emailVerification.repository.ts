import { Injectable } from "@nestjs/common";
import PrismaService from "../../shared/infrastructure/db/prisma.service";
import { EmailVerification } from "../domain/emailVerification";
import EmailVerificationId from "../domain/emailVerificationId";
import UserId from "../../shared/domain/userId";

@Injectable()
export class EmailVerificationRepository {
  constructor(private prismaService: PrismaService) {}

  async createVerificationRecord(
    emailVerification: EmailVerification,
  ): Promise<EmailVerification> {
    const emailVerificationPrimitives = emailVerification.toPrimitives();
    try {
      await this.prismaService.emailVerification.create({
        data: {
          id: emailVerificationPrimitives.id,
          userId: emailVerificationPrimitives.userId,
          language: emailVerificationPrimitives.language,
          verified: emailVerificationPrimitives.verified,
          lastEmailSentAt: emailVerificationPrimitives.lastEmailSentAt,
          createdAt: emailVerificationPrimitives.createdAt,
          updatedAt: emailVerificationPrimitives.updatedAt,
        },
      });
      return emailVerification;
    } catch (e) {
      return undefined;
    }
  }

  async getVerificationRecordById(
    id: EmailVerificationId,
  ): Promise<EmailVerification> {
    const result = await this.prismaService.emailVerification.findFirst({
      where: { id: id.toPrimitive() },
      include: { user: { select: { email: true } } },
    });
    return result
      ? EmailVerification.fromPrimitives({
          ...result,
          email: result.user.email,
        })
      : undefined;
  }

  async getVerificationRecordByUserId(
    userId: UserId,
  ): Promise<EmailVerification> {
    const result = await this.prismaService.emailVerification.findFirst({
      where: { userId: userId.toPrimitive() },
      include: { user: { select: { email: true } } },
    });
    return result
      ? EmailVerification.fromPrimitives({
          ...result,
          email: result.user.email,
        })
      : undefined;
  }

  async updateVerificationRecord(
    emailVerification: EmailVerification,
  ): Promise<EmailVerification> {
    try {
      const emailVerificationPrimitives = emailVerification.toPrimitives();
      await this.prismaService.emailVerification.update({
        where: { id: emailVerification.getId().toPrimitive() },
        data: {
          id: emailVerificationPrimitives.id,
          userId: emailVerificationPrimitives.userId,
          language: emailVerificationPrimitives.language,
          verified: emailVerificationPrimitives.verified,
          lastEmailSentAt: emailVerificationPrimitives.lastEmailSentAt,
          createdAt: emailVerificationPrimitives.createdAt,
          updatedAt: emailVerificationPrimitives.updatedAt,
        },
      });
      return emailVerification;
    } catch {
      return undefined;
    }
  }
}

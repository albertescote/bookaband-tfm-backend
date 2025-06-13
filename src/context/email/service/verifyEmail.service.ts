import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { VerificationStatus } from "../domain/verificationStatus";
import { Inject } from "@nestjs/common";
import { EmailVerificationRepository } from "../infrastructure/emailVerification.repository";
import EmailVerificationId from "../domain/emailVerificationId";
import { NotAbleToExecuteEmailVerificationDbTransactionException } from "../exceptions/notAbleToExecuteEmailVerificationDbTransactionException";
import { EmailVerificationNotFoundException } from "../exceptions/emailVerificationNotFoundException";

export class VerifyEmailResponse {
  status: VerificationStatus;
  message?: string;
}

export class VerifyEmailService {
  constructor(
    @Inject("JoseWrapperInitialized")
    private readonly joseWrapper: JoseWrapper,
    private readonly emailVerificationRepository: EmailVerificationRepository,
  ) {}

  async execute(token: string): Promise<VerifyEmailResponse> {
    const verificationResult = await this.joseWrapper.verifyJwt(token);

    if (
      !verificationResult.valid ||
      !verificationResult.decodedPayload?.emailVerificationId
    ) {
      return {
        status: VerificationStatus.FAILED,
        message: "Invalid verification token",
      };
    }

    const emailVerificationId =
      verificationResult.decodedPayload.emailVerificationId;

    const emailVerification =
      await this.emailVerificationRepository.getVerificationRecordById(
        new EmailVerificationId(emailVerificationId),
      );
    if (!emailVerification) {
      throw new EmailVerificationNotFoundException();
    }

    emailVerification.verifyEmail();
    const updated =
      await this.emailVerificationRepository.updateVerificationRecord(
        emailVerification,
      );
    if (!updated) {
      throw new NotAbleToExecuteEmailVerificationDbTransactionException(
        "update verification record",
      );
    }

    return {
      status: VerificationStatus.VERIFIED,
    };
  }
}

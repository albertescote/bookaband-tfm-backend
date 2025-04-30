import { JoseWrapper } from "../../shared/infrastructure/joseWrapper";
import { InvalidTokenException } from "../exceptions/invalidTokenException";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { VerificationStatus } from "../domain/verificationStatus";
import { Inject } from "@nestjs/common";
import { UserNotFoundException } from "../exceptions/userNotFoundException";
import { SendVerificationEmailCommand } from "./sendVerificationEmail.command";
import { CommandBus } from "@nestjs/cqrs";

export class VerifyEmailResponse {
  status: VerificationStatus;
  message?: string;
}

export class VerifyEmailService {
  private readonly RATE_LIMIT_SECONDS = 30;

  constructor(
    @Inject("JoseWrapperInitialized")
    private readonly joseWrapper: JoseWrapper,
    private readonly moduleConnectors: ModuleConnectors,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(token: string): Promise<VerifyEmailResponse> {
    try {
      const verificationResult = await this.joseWrapper.verifyJwt(token);

      if (
        !verificationResult.valid ||
        !verificationResult.decodedPayload?.userId
      ) {
        throw new InvalidTokenException();
      }

      await this.moduleConnectors.verifyUserEmail(
        verificationResult.decodedPayload.userId,
      );
      return {
        status: VerificationStatus.VERIFIED,
      };
    } catch (e) {
      return {
        status: VerificationStatus.FAILED,
        message: e.message,
      };
    }
  }

  async resendEmail(userId: string): Promise<void> {
    const storedUser =
      await this.moduleConnectors.obtainUserInformation(userId);
    if (!storedUser) {
      throw new UserNotFoundException(userId);
    }

    const userPrimitives = storedUser.toPrimitives();
    // const now = new Date();
    // const lastEmailSentAt = userPrimitives.lastEmailSentAt
    //   ? new Date(userPrimitives.lastEmailSentAt)
    //   : null;
    //
    // if (lastEmailSentAt) {
    //   const secondsSinceLastEmail =
    //     (now.getTime() - lastEmailSentAt.getTime()) / 1000;
    //   if (secondsSinceLastEmail < this.RATE_LIMIT_SECONDS) {
    //     throw new EmailRateLimitExceededException();
    //   }
    // }

    const token = await this.joseWrapper.signJwt(
      { userId: userPrimitives.id },
      "bookaband",
      3600,
    );
    const sendVerificationEmailCommand = new SendVerificationEmailCommand(
      userPrimitives.email,
      token,
    );
    await this.commandBus.execute(sendVerificationEmailCommand);

    // Update the last email sent timestamp
  }
}

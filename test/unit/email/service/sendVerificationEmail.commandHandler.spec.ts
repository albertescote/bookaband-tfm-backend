import { Test, TestingModule } from "@nestjs/testing";
import { SendVerificationEmailCommandHandler } from "../../../../src/context/email/service/sendVerificationEmail.commandHandler";
import { SendVerificationEmailCommand } from "../../../../src/context/email/service/sendVerificationEmail.command";
import { JoseWrapper } from "../../../../src/context/shared/infrastructure/joseWrapper";
import { EmailVerificationRepository } from "../../../../src/context/email/infrastructure/emailVerification.repository";
import { NotAbleToExecuteEmailVerificationDbTransactionException } from "../../../../src/context/email/exceptions/notAbleToExecuteEmailVerificationDbTransactionException";
import { Languages } from "../../../../src/context/shared/domain/languages";
import { EmailVerification } from "../../../../src/context/email/domain/emailVerification";
import EmailVerificationId from "../../../../src/context/email/domain/emailVerificationId";
import { Resend } from "resend";
import UserId from "../../../../src/context/shared/domain/userId";

jest.mock("resend");

describe("SendVerificationEmailCommandHandler", () => {
  let handler: SendVerificationEmailCommandHandler;
  let joseWrapper: jest.Mocked<JoseWrapper>;
  let emailVerificationRepository: jest.Mocked<EmailVerificationRepository>;
  let mockResend: jest.Mocked<Resend>;

  const mockResendApiKey = "test-api-key";
  const mockUserId = UserId.generate().toPrimitive();
  const mockEmail = "test@example.com";
  const mockLanguage = Languages.ENGLISH;
  const mockEmailVerificationId = EmailVerificationId.generate().toPrimitive();
  const mockToken = "test-token";

  beforeEach(async () => {
    joseWrapper = {
      signJwt: jest.fn(),
    } as any;

    emailVerificationRepository = {
      createVerificationRecord: jest.fn(),
    } as any;

    mockResend = {
      emails: {
        send: jest.fn(),
      },
    } as any;

    (Resend as jest.Mock).mockImplementation(() => mockResend);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendVerificationEmailCommandHandler,
        {
          provide: "resend-api-key",
          useValue: mockResendApiKey,
        },
        {
          provide: "JoseWrapperInitialized",
          useValue: joseWrapper,
        },
        {
          provide: EmailVerificationRepository,
          useValue: emailVerificationRepository,
        },
      ],
    }).compile();

    handler = module.get<SendVerificationEmailCommandHandler>(
      SendVerificationEmailCommandHandler,
    );
  });

  describe("execute", () => {
    it("should successfully create verification record and send email", async () => {
      const mockEmailVerification = {
        getId: jest
          .fn()
          .mockReturnValue(new EmailVerificationId(mockEmailVerificationId)),
      } as unknown as EmailVerification;

      emailVerificationRepository.createVerificationRecord.mockResolvedValue(
        mockEmailVerification,
      );
      joseWrapper.signJwt.mockResolvedValue(mockToken);
      (mockResend.emails.send as jest.Mock).mockResolvedValue({});

      const command = new SendVerificationEmailCommand(
        mockEmail,
        mockUserId,
        mockLanguage,
      );
      await handler.execute(command);

      expect(
        emailVerificationRepository.createVerificationRecord,
      ).toHaveBeenCalled();
      expect(joseWrapper.signJwt).toHaveBeenCalledWith(
        { emailVerificationId: mockEmailVerificationId },
        "BookaBand",
        3600,
      );
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: "BookaBand <onboarding@resend.dev>",
        to: mockEmail,
        subject: expect.any(String),
        html: expect.any(String),
      });
    });

    it("should throw NotAbleToExecuteEmailVerificationDbTransactionException when verification record creation fails", async () => {
      emailVerificationRepository.createVerificationRecord.mockResolvedValue(
        null,
      );

      const command = new SendVerificationEmailCommand(
        mockEmail,
        mockUserId,
        mockLanguage,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        NotAbleToExecuteEmailVerificationDbTransactionException,
      );
      expect(
        emailVerificationRepository.createVerificationRecord,
      ).toHaveBeenCalled();
      expect(joseWrapper.signJwt).not.toHaveBeenCalled();
      expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it("should handle email sending failure gracefully", async () => {
      const mockEmailVerification = {
        getId: jest
          .fn()
          .mockReturnValue(new EmailVerificationId(mockEmailVerificationId)),
      } as unknown as EmailVerification;

      emailVerificationRepository.createVerificationRecord.mockResolvedValue(
        mockEmailVerification,
      );
      joseWrapper.signJwt.mockResolvedValue(mockToken);
      (mockResend.emails.send as jest.Mock).mockRejectedValue(
        new Error("Failed to send email"),
      );

      const command = new SendVerificationEmailCommand(
        mockEmail,
        mockUserId,
        mockLanguage,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        "Failed to send email",
      );
      expect(
        emailVerificationRepository.createVerificationRecord,
      ).toHaveBeenCalled();
      expect(joseWrapper.signJwt).toHaveBeenCalled();
      expect(mockResend.emails.send).toHaveBeenCalled();
    });
  });
});

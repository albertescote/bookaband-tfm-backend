import { Test, TestingModule } from "@nestjs/testing";
import { ResendVerificationEmailCommandHandler } from "../../../../src/context/email/service/resendVerificationEmail.commandHandler";
import { ResendVerificationEmailCommand } from "../../../../src/context/email/service/resendVerificationEmail.command";
import { JoseWrapper } from "../../../../src/context/shared/infrastructure/joseWrapper";
import { EmailVerificationRepository } from "../../../../src/context/email/infrastructure/emailVerification.repository";
import { EmailVerificationNotFoundException } from "../../../../src/context/email/exceptions/emailVerificationNotFoundException";
import { EmailAlreadyVerifiedException } from "../../../../src/context/email/exceptions/emailAlreadyVerifiedException";
import {
  Language,
  Languages,
} from "../../../../src/context/shared/domain/languages";
import { EmailVerification } from "../../../../src/context/email/domain/emailVerification";
import EmailVerificationId from "../../../../src/context/email/domain/emailVerificationId";
import { Resend } from "resend";
import UserId from "../../../../src/context/shared/domain/userId";

jest.mock("resend");

describe("ResendVerificationEmailCommandHandler", () => {
  let handler: ResendVerificationEmailCommandHandler;
  let joseWrapper: jest.Mocked<JoseWrapper>;
  let emailVerificationRepository: jest.Mocked<EmailVerificationRepository>;
  let mockResend: jest.Mocked<Resend>;

  const mockResendApiKey = "test-api-key";
  const mockUserId = UserId.generate().toPrimitive();
  const mockEmail = "test@example.com";
  const mockLanguage = new Language(Languages.ENGLISH);
  const mockEmailVerificationId = EmailVerificationId.generate().toPrimitive();
  const mockToken = "test-token";

  beforeEach(async () => {
    joseWrapper = {
      signJwt: jest.fn(),
    } as any;

    emailVerificationRepository = {
      getVerificationRecordByUserId: jest.fn(),
      updateVerificationRecord: jest.fn(),
    } as any;

    mockResend = {
      emails: {
        send: jest.fn(),
      },
    } as any;

    (Resend as jest.Mock).mockImplementation(() => mockResend);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendVerificationEmailCommandHandler,
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

    handler = module.get<ResendVerificationEmailCommandHandler>(
      ResendVerificationEmailCommandHandler,
    );
  });

  describe("execute", () => {
    it("should successfully resend verification email", async () => {
      const mockEmailVerification = {
        getId: jest
          .fn()
          .mockReturnValue(new EmailVerificationId(mockEmailVerificationId)),
        getLanguage: jest.fn().mockReturnValue(mockLanguage),
        toPrimitives: jest.fn().mockReturnValue({
          verified: false,
          email: mockEmail,
        }),
        updateLastEmailSentAt: jest.fn(),
      } as unknown as EmailVerification;

      emailVerificationRepository.getVerificationRecordByUserId.mockResolvedValue(
        mockEmailVerification,
      );
      joseWrapper.signJwt.mockResolvedValue(mockToken);
      emailVerificationRepository.updateVerificationRecord.mockResolvedValue(
        mockEmailVerification,
      );
      (mockResend.emails.send as jest.Mock).mockResolvedValue({});

      const command = new ResendVerificationEmailCommand(mockUserId);
      await handler.execute(command);

      expect(
        emailVerificationRepository.getVerificationRecordByUserId,
      ).toHaveBeenCalled();
      expect(mockEmailVerification.updateLastEmailSentAt).toHaveBeenCalled();
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
      expect(
        emailVerificationRepository.updateVerificationRecord,
      ).toHaveBeenCalledWith(mockEmailVerification);
    });

    it("should throw EmailVerificationNotFoundException when verification record is not found", async () => {
      emailVerificationRepository.getVerificationRecordByUserId.mockResolvedValue(
        null,
      );

      const command = new ResendVerificationEmailCommand(mockUserId);

      await expect(handler.execute(command)).rejects.toThrow(
        EmailVerificationNotFoundException,
      );
      expect(
        emailVerificationRepository.getVerificationRecordByUserId,
      ).toHaveBeenCalled();
      expect(joseWrapper.signJwt).not.toHaveBeenCalled();
      expect(mockResend.emails.send).not.toHaveBeenCalled();
      expect(
        emailVerificationRepository.updateVerificationRecord,
      ).not.toHaveBeenCalled();
    });

    it("should throw EmailAlreadyVerifiedException when email is already verified", async () => {
      const mockEmailVerification = {
        toPrimitives: jest.fn().mockReturnValue({
          verified: true,
          email: mockEmail,
        }),
      } as unknown as EmailVerification;

      emailVerificationRepository.getVerificationRecordByUserId.mockResolvedValue(
        mockEmailVerification,
      );

      const command = new ResendVerificationEmailCommand(mockUserId);

      await expect(handler.execute(command)).rejects.toThrow(
        EmailAlreadyVerifiedException,
      );
      expect(
        emailVerificationRepository.getVerificationRecordByUserId,
      ).toHaveBeenCalled();
      expect(joseWrapper.signJwt).not.toHaveBeenCalled();
      expect(mockResend.emails.send).not.toHaveBeenCalled();
      expect(
        emailVerificationRepository.updateVerificationRecord,
      ).not.toHaveBeenCalled();
    });

    it("should handle email sending failure gracefully", async () => {
      const mockEmailVerification = {
        getId: jest
          .fn()
          .mockReturnValue(new EmailVerificationId(mockEmailVerificationId)),
        getLanguage: jest.fn().mockReturnValue(mockLanguage),
        toPrimitives: jest.fn().mockReturnValue({
          verified: false,
          email: mockEmail,
        }),
        updateLastEmailSentAt: jest.fn(),
      } as unknown as EmailVerification;

      emailVerificationRepository.getVerificationRecordByUserId.mockResolvedValue(
        mockEmailVerification,
      );
      joseWrapper.signJwt.mockResolvedValue(mockToken);
      (mockResend.emails.send as jest.Mock).mockRejectedValue(
        new Error("Failed to send email"),
      );

      const command = new ResendVerificationEmailCommand(mockUserId);

      await expect(handler.execute(command)).rejects.toThrow(
        "Failed to send email",
      );
      expect(
        emailVerificationRepository.getVerificationRecordByUserId,
      ).toHaveBeenCalled();
      expect(mockEmailVerification.updateLastEmailSentAt).toHaveBeenCalled();
      expect(joseWrapper.signJwt).toHaveBeenCalled();
      expect(mockResend.emails.send).toHaveBeenCalled();
      expect(
        emailVerificationRepository.updateVerificationRecord,
      ).not.toHaveBeenCalled();
    });
  });
});

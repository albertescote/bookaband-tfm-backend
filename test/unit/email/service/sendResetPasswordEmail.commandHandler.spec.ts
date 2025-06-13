import { Test, TestingModule } from "@nestjs/testing";
import { SendResetPasswordEmailCommandHandler } from "../../../../src/context/email/service/sendResetPasswordEmail.commandHandler";
import { SendResetPasswordEmailCommand } from "../../../../src/context/email/service/sendResetPasswordEmail.command";
import { JoseWrapper } from "../../../../src/context/shared/infrastructure/joseWrapper";
import { ResetPasswordRepository } from "../../../../src/context/email/infrastructure/resetPassword.repository";
import { Languages } from "../../../../src/context/shared/domain/languages";
import { ResetPasswordSession } from "../../../../src/context/email/domain/resetPasswordSession";
import SessionId from "../../../../src/context/email/domain/sessionId";
import { Resend } from "resend";
import UserId from "../../../../src/context/shared/domain/userId";

jest.mock("resend");

describe("SendResetPasswordEmailCommandHandler", () => {
  let handler: SendResetPasswordEmailCommandHandler;
  let joseWrapper: jest.Mocked<JoseWrapper>;
  let resetPasswordRepository: jest.Mocked<ResetPasswordRepository>;
  let mockResend: jest.Mocked<Resend>;

  const mockResendApiKey = "test-api-key";
  const mockUserId = UserId.generate().toPrimitive();
  const mockEmail = "test@example.com";
  const mockLanguage = Languages.ENGLISH;
  const mockSessionId = SessionId.generate().toPrimitive();
  const mockToken = "test-token";

  beforeEach(async () => {
    joseWrapper = {
      signJwt: jest.fn(),
    } as any;

    resetPasswordRepository = {
      save: jest.fn(),
    } as any;

    mockResend = {
      emails: {
        send: jest.fn(),
      },
    } as any;

    (Resend as jest.Mock).mockImplementation(() => mockResend);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendResetPasswordEmailCommandHandler,
        {
          provide: "resend-api-key",
          useValue: mockResendApiKey,
        },
        {
          provide: "JoseWrapperInitialized",
          useValue: joseWrapper,
        },
        {
          provide: ResetPasswordRepository,
          useValue: resetPasswordRepository,
        },
      ],
    }).compile();

    handler = module.get<SendResetPasswordEmailCommandHandler>(
      SendResetPasswordEmailCommandHandler,
    );
  });

  describe("execute", () => {
    it("should successfully create reset password session and send email", async () => {
      const mockResetPasswordSession = {
        getSessionId: jest.fn().mockReturnValue(new SessionId(mockSessionId)),
      } as unknown as ResetPasswordSession;

      jest
        .spyOn(ResetPasswordSession, "create")
        .mockReturnValue(mockResetPasswordSession);
      resetPasswordRepository.save.mockResolvedValue(undefined);
      joseWrapper.signJwt.mockResolvedValue(mockToken);
      (mockResend.emails.send as jest.Mock).mockResolvedValue({});

      const command = new SendResetPasswordEmailCommand(
        mockUserId,
        mockEmail,
        mockLanguage,
      );
      await handler.execute(command);

      expect(ResetPasswordSession.create).toHaveBeenCalledWith(
        expect.any(Object),
        mockLanguage,
      );
      expect(resetPasswordRepository.save).toHaveBeenCalledWith(
        mockResetPasswordSession,
      );
      expect(joseWrapper.signJwt).toHaveBeenCalledWith(
        { sessionId: mockSessionId },
        "BookaBand",
        1800,
      );
      expect(mockResend.emails.send).toHaveBeenCalledWith({
        from: "BookaBand <onboarding@resend.dev>",
        to: mockEmail,
        subject: expect.any(String),
        html: expect.any(String),
      });
    });

    it("should handle repository save failure gracefully", async () => {
      const mockResetPasswordSession = {
        getSessionId: jest.fn().mockReturnValue(new SessionId(mockSessionId)),
      } as unknown as ResetPasswordSession;

      jest
        .spyOn(ResetPasswordSession, "create")
        .mockReturnValue(mockResetPasswordSession);
      resetPasswordRepository.save.mockRejectedValue(
        new Error("Failed to save session"),
      );

      const command = new SendResetPasswordEmailCommand(
        mockUserId,
        mockEmail,
        mockLanguage,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        "Failed to save session",
      );
      expect(ResetPasswordSession.create).toHaveBeenCalled();
      expect(resetPasswordRepository.save).toHaveBeenCalled();
      expect(joseWrapper.signJwt).not.toHaveBeenCalled();
      expect(mockResend.emails.send).not.toHaveBeenCalled();
    });

    it("should handle email sending failure gracefully", async () => {
      const mockResetPasswordSession = {
        getSessionId: jest.fn().mockReturnValue(new SessionId(mockSessionId)),
      } as unknown as ResetPasswordSession;

      jest
        .spyOn(ResetPasswordSession, "create")
        .mockReturnValue(mockResetPasswordSession);
      resetPasswordRepository.save.mockResolvedValue(undefined);
      joseWrapper.signJwt.mockResolvedValue(mockToken);
      (mockResend.emails.send as jest.Mock).mockRejectedValue(
        new Error("Failed to send email"),
      );

      const command = new SendResetPasswordEmailCommand(
        mockUserId,
        mockEmail,
        mockLanguage,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        "Failed to send email",
      );
      expect(ResetPasswordSession.create).toHaveBeenCalled();
      expect(resetPasswordRepository.save).toHaveBeenCalled();
      expect(joseWrapper.signJwt).toHaveBeenCalled();
      expect(mockResend.emails.send).toHaveBeenCalled();
    });
  });
});

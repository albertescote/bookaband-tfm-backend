import { Test, TestingModule } from "@nestjs/testing";
import { GetResetPasswordSessionQueryHandler } from "../../../../src/context/email/service/getResetPasswordSession.queryHandler";
import { GetResetPasswordSessionQuery } from "../../../../src/context/email/service/getResetPasswordSession.query";
import { ResetPasswordRepository } from "../../../../src/context/email/infrastructure/resetPassword.repository";
import { ResetPasswordSession } from "../../../../src/context/email/domain/resetPasswordSession";
import { Languages } from "../../../../src/context/shared/domain/languages";
import SessionId from "../../../../src/context/email/domain/sessionId";
import UserId from "../../../../src/context/shared/domain/userId";

describe("GetResetPasswordSessionQueryHandler", () => {
  let handler: GetResetPasswordSessionQueryHandler;
  let resetPasswordRepository: jest.Mocked<ResetPasswordRepository>;

  const mockSessionId = SessionId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();
  const mockLanguage = Languages.ENGLISH;
  const mockLastEmailSentAt = new Date();

  beforeEach(async () => {
    resetPasswordRepository = {
      getByKey: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetResetPasswordSessionQueryHandler,
        {
          provide: ResetPasswordRepository,
          useValue: resetPasswordRepository,
        },
      ],
    }).compile();

    handler = module.get<GetResetPasswordSessionQueryHandler>(
      GetResetPasswordSessionQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return session primitives when session exists", async () => {
      const mockResetPasswordSession = {
        toPrimitives: jest.fn().mockReturnValue({
          id: mockSessionId,
          userId: mockUserId,
          language: mockLanguage,
          lastEmailSentAt: mockLastEmailSentAt,
        }),
      } as unknown as ResetPasswordSession;

      resetPasswordRepository.getByKey.mockResolvedValue(
        mockResetPasswordSession,
      );

      const query = new GetResetPasswordSessionQuery(mockSessionId);
      const result = await handler.execute(query);

      expect(resetPasswordRepository.getByKey).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(mockResetPasswordSession.toPrimitives).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockSessionId,
        userId: mockUserId,
        language: mockLanguage,
        lastEmailSentAt: mockLastEmailSentAt,
      });
    });

    it("should return undefined when session does not exist", async () => {
      resetPasswordRepository.getByKey.mockResolvedValue(null);

      const query = new GetResetPasswordSessionQuery(mockSessionId);
      const result = await handler.execute(query);

      expect(resetPasswordRepository.getByKey).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(result).toBeUndefined();
    });

    it("should handle repository errors gracefully", async () => {
      resetPasswordRepository.getByKey.mockRejectedValue(
        new Error("Database error"),
      );

      const query = new GetResetPasswordSessionQuery(mockSessionId);

      await expect(handler.execute(query)).rejects.toThrow("Database error");
      expect(resetPasswordRepository.getByKey).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });
  });
});

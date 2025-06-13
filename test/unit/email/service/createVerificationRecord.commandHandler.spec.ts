import { Test, TestingModule } from "@nestjs/testing";
import { CreateVerificationRecordCommandHandler } from "../../../../src/context/email/service/createVerificationRecord.commandHandler";
import { CreateVerificationRecordCommand } from "../../../../src/context/email/service/createVerificationRecord.command";
import { EmailVerificationRepository } from "../../../../src/context/email/infrastructure/emailVerification.repository";
import { NotAbleToExecuteEmailVerificationDbTransactionException } from "../../../../src/context/email/exceptions/notAbleToExecuteEmailVerificationDbTransactionException";
import { EmailVerification } from "../../../../src/context/email/domain/emailVerification";
import { Languages } from "../../../../src/context/shared/domain/languages";
import UserId from "../../../../src/context/shared/domain/userId";

describe("CreateVerificationRecordCommandHandler", () => {
  let handler: CreateVerificationRecordCommandHandler;
  let emailVerificationRepository: jest.Mocked<EmailVerificationRepository>;

  const mockUserId = UserId.generate().toPrimitive();
  const mockEmail = "test@example.com";
  const mockLanguage = Languages.ENGLISH;

  beforeEach(async () => {
    emailVerificationRepository = {
      createVerificationRecord: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVerificationRecordCommandHandler,
        {
          provide: EmailVerificationRepository,
          useValue: emailVerificationRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateVerificationRecordCommandHandler>(
      CreateVerificationRecordCommandHandler,
    );
  });

  describe("execute", () => {
    it("should successfully create unverified email verification record", async () => {
      const mockEmailVerification = {
        verifyEmail: jest.fn(),
      } as unknown as EmailVerification;

      jest
        .spyOn(EmailVerification, "create")
        .mockReturnValue(mockEmailVerification);
      emailVerificationRepository.createVerificationRecord.mockResolvedValue(
        mockEmailVerification,
      );

      const command = new CreateVerificationRecordCommand(
        mockEmail,
        mockUserId,
        mockLanguage,
        false,
      );
      await handler.execute(command);

      expect(EmailVerification.create).toHaveBeenCalledWith(
        expect.any(Object),
        mockLanguage,
        mockEmail,
      );
      expect(mockEmailVerification.verifyEmail).not.toHaveBeenCalled();
      expect(
        emailVerificationRepository.createVerificationRecord,
      ).toHaveBeenCalledWith(mockEmailVerification);
    });

    it("should successfully create verified email verification record", async () => {
      const mockEmailVerification = {
        verifyEmail: jest.fn(),
      } as unknown as EmailVerification;

      jest
        .spyOn(EmailVerification, "create")
        .mockReturnValue(mockEmailVerification);
      emailVerificationRepository.createVerificationRecord.mockResolvedValue(
        mockEmailVerification,
      );

      const command = new CreateVerificationRecordCommand(
        mockEmail,
        mockUserId,
        mockLanguage,
        true,
      );
      await handler.execute(command);

      expect(EmailVerification.create).toHaveBeenCalledWith(
        expect.any(Object),
        mockLanguage,
        mockEmail,
      );
      expect(mockEmailVerification.verifyEmail).toHaveBeenCalled();
      expect(
        emailVerificationRepository.createVerificationRecord,
      ).toHaveBeenCalledWith(mockEmailVerification);
    });

    it("should throw NotAbleToExecuteEmailVerificationDbTransactionException when repository returns null", async () => {
      const mockEmailVerification = {
        verifyEmail: jest.fn(),
      } as unknown as EmailVerification;

      jest
        .spyOn(EmailVerification, "create")
        .mockReturnValue(mockEmailVerification);
      emailVerificationRepository.createVerificationRecord.mockResolvedValue(
        null,
      );

      const command = new CreateVerificationRecordCommand(
        mockEmail,
        mockUserId,
        mockLanguage,
        false,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        NotAbleToExecuteEmailVerificationDbTransactionException,
      );
      expect(EmailVerification.create).toHaveBeenCalled();
      expect(
        emailVerificationRepository.createVerificationRecord,
      ).toHaveBeenCalled();
    });

    it("should throw NotAbleToExecuteEmailVerificationDbTransactionException when repository throws error", async () => {
      const mockEmailVerification = {
        verifyEmail: jest.fn(),
      } as unknown as EmailVerification;

      jest
        .spyOn(EmailVerification, "create")
        .mockReturnValue(mockEmailVerification);
      emailVerificationRepository.createVerificationRecord.mockResolvedValue(
        undefined,
      );

      const command = new CreateVerificationRecordCommand(
        mockEmail,
        mockUserId,
        mockLanguage,
        false,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        NotAbleToExecuteEmailVerificationDbTransactionException,
      );
      expect(EmailVerification.create).toHaveBeenCalled();
      expect(
        emailVerificationRepository.createVerificationRecord,
      ).toHaveBeenCalled();
    });
  });
});

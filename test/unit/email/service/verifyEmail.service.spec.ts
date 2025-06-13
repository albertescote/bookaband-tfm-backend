import { Test, TestingModule } from "@nestjs/testing";
import { VerifyEmailService } from "../../../../src/context/email/service/verifyEmail.service";
import { JoseWrapper } from "../../../../src/context/shared/infrastructure/joseWrapper";
import { EmailVerificationRepository } from "../../../../src/context/email/infrastructure/emailVerification.repository";
import { VerificationStatus } from "../../../../src/context/email/domain/verificationStatus";
import { EmailVerificationNotFoundException } from "../../../../src/context/email/exceptions/emailVerificationNotFoundException";
import { NotAbleToExecuteEmailVerificationDbTransactionException } from "../../../../src/context/email/exceptions/notAbleToExecuteEmailVerificationDbTransactionException";
import EmailVerificationId from "../../../../src/context/email/domain/emailVerificationId";
import { EmailVerification } from "../../../../src/context/email/domain/emailVerification";

describe("VerifyEmailService", () => {
  let service: VerifyEmailService;
  let joseWrapper: jest.Mocked<JoseWrapper>;
  let emailVerificationRepository: jest.Mocked<EmailVerificationRepository>;

  const mockEmailVerificationId = EmailVerificationId.generate().toPrimitive();
  const mockToken = "test-token";

  beforeEach(async () => {
    joseWrapper = {
      verifyJwt: jest.fn(),
    } as any;

    emailVerificationRepository = {
      getVerificationRecordById: jest.fn(),
      updateVerificationRecord: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyEmailService,
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

    service = module.get<VerifyEmailService>(VerifyEmailService);
  });

  describe("execute", () => {
    it("should return FAILED status when token is invalid", async () => {
      joseWrapper.verifyJwt.mockResolvedValue({
        valid: false,
        decodedPayload: null,
      });

      const result = await service.execute(mockToken);

      expect(result).toEqual({
        status: VerificationStatus.FAILED,
        message: "Invalid verification token",
      });
    });

    it("should return FAILED status when token payload is missing emailVerificationId", async () => {
      joseWrapper.verifyJwt.mockResolvedValue({
        valid: true,
        decodedPayload: {},
      });

      const result = await service.execute(mockToken);

      expect(result).toEqual({
        status: VerificationStatus.FAILED,
        message: "Invalid verification token",
      });
    });

    it("should throw EmailVerificationNotFoundException when verification record is not found", async () => {
      joseWrapper.verifyJwt.mockResolvedValue({
        valid: true,
        decodedPayload: { emailVerificationId: mockEmailVerificationId },
      });

      emailVerificationRepository.getVerificationRecordById.mockResolvedValue(
        null,
      );

      await expect(service.execute(mockToken)).rejects.toThrow(
        EmailVerificationNotFoundException,
      );
    });

    it("should successfully verify email and return VERIFIED status", async () => {
      const mockEmailVerification = {
        verifyEmail: jest.fn(),
      } as unknown as EmailVerification;

      joseWrapper.verifyJwt.mockResolvedValue({
        valid: true,
        decodedPayload: { emailVerificationId: mockEmailVerificationId },
      });

      emailVerificationRepository.getVerificationRecordById.mockResolvedValue(
        mockEmailVerification,
      );
      emailVerificationRepository.updateVerificationRecord.mockResolvedValue(
        mockEmailVerification,
      );

      const result = await service.execute(mockToken);

      expect(mockEmailVerification.verifyEmail).toHaveBeenCalled();
      expect(
        emailVerificationRepository.updateVerificationRecord,
      ).toHaveBeenCalledWith(mockEmailVerification);
      expect(result).toEqual({
        status: VerificationStatus.VERIFIED,
      });
    });

    it("should throw NotAbleToExecuteEmailVerificationDbTransactionException when update fails", async () => {
      const mockEmailVerification = {
        verifyEmail: jest.fn(),
      } as unknown as EmailVerification;

      joseWrapper.verifyJwt.mockResolvedValue({
        valid: true,
        decodedPayload: { emailVerificationId: mockEmailVerificationId },
      });

      emailVerificationRepository.getVerificationRecordById.mockResolvedValue(
        mockEmailVerification,
      );
      emailVerificationRepository.updateVerificationRecord.mockResolvedValue(
        null,
      );

      await expect(service.execute(mockToken)).rejects.toThrow(
        NotAbleToExecuteEmailVerificationDbTransactionException,
      );
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { EmailController } from "../../../../src/app/api/email/email.controller";
import { VerifyEmailService } from "../../../../src/context/email/service/verifyEmail.service";
import { CommandBus } from "@nestjs/cqrs";
import {
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from "../../../../src/app/api/email/verifyEmail.dto";
import { ResendEmailRequestDto } from "../../../../src/app/api/email/resendEmail.dto";
import { VerificationStatus } from "../../../../src/context/email/domain/verificationStatus";
import { ResendVerificationEmailCommand } from "../../../../src/context/email/service/resendVerificationEmail.command";

describe("EmailController", () => {
  let controller: EmailController;

  const mockVerifyEmailService = {
    execute: jest.fn(),
  };

  const mockCommandBus = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: VerifyEmailService,
          useValue: mockVerifyEmailService,
        },
        {
          provide: CommandBus,
          useValue: mockCommandBus,
        },
      ],
    }).compile();

    controller = module.get<EmailController>(EmailController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("verifyEmail", () => {
    it("should verify an email with a valid token", async () => {
      const verifyEmailDto: VerifyEmailRequestDto = {
        token: "valid.jwt.token",
      };

      const expectedResponse: VerifyEmailResponseDto = {
        status: VerificationStatus.VERIFIED,
        message: "Email verified successfully",
      };

      mockVerifyEmailService.execute.mockResolvedValue(expectedResponse);

      const result = await controller.verifyEmail(verifyEmailDto);

      expect(result).toEqual(expectedResponse);
      expect(mockVerifyEmailService.execute).toHaveBeenCalledWith(
        verifyEmailDto.token,
      );
    });

    it("should handle invalid token", async () => {
      const verifyEmailDto: VerifyEmailRequestDto = {
        token: "invalid.jwt.token",
      };

      const expectedResponse: VerifyEmailResponseDto = {
        status: VerificationStatus.FAILED,
        message: "Invalid verification token",
      };

      mockVerifyEmailService.execute.mockResolvedValue(expectedResponse);

      const result = await controller.verifyEmail(verifyEmailDto);

      expect(result).toEqual(expectedResponse);
      expect(mockVerifyEmailService.execute).toHaveBeenCalledWith(
        verifyEmailDto.token,
      );
    });
  });

  describe("resendEmail", () => {
    it("should resend verification email", async () => {
      const resendEmailDto: ResendEmailRequestDto = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
      };

      await controller.resendEmail(resendEmailDto);

      expect(mockCommandBus.execute).toHaveBeenCalledWith(
        expect.any(ResendVerificationEmailCommand),
      );
      expect(mockCommandBus.execute.mock.calls[0][0].userId).toBe(
        resendEmailDto.userId,
      );
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { InvitationController } from "../../../../src/app/api/invitation/invitation.controller";
import { InvitationService } from "../../../../src/context/invitation/service/invitation.service";
import { SendInvitationRequestDto } from "../../../../src/app/api/invitation/sendInvitationRequest.dto";
import { InvitationResponseDto } from "../../../../src/app/api/invitation/invitationResponse.dto";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { InvitationStatus } from "../../../../src/context/shared/domain/invitationStatus";

describe("InvitationController", () => {
  let controller: InvitationController;

  const mockInvitationService = {
    sendInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
    declineInvitation: jest.fn(),
    getUserInvitations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationController],
      providers: [
        {
          provide: InvitationService,
          useValue: mockInvitationService,
        },
      ],
    }).compile();

    controller = module.get<InvitationController>(InvitationController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("sendInvitation", () => {
    it("should send an invitation", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const sendInvitationDto: SendInvitationRequestDto = {
        userEmail: "invited@example.com",
        bandId: "band-123",
      };

      const expectedResponse: InvitationResponseDto = {
        id: "1",
        bandId: "band-123",
        userId: "2",
        status: InvitationStatus.PENDING,
        createdAt: new Date(),
      };

      mockInvitationService.sendInvitation.mockResolvedValue(expectedResponse);

      const result = await controller.sendInvitation(sendInvitationDto, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockInvitationService.sendInvitation).toHaveBeenCalledWith(
        mockUser,
        sendInvitationDto.bandId,
        sendInvitationDto.userEmail,
      );
    });
  });

  describe("acceptInvitation", () => {
    it("should accept an invitation", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const invitationId = "1";

      const expectedResponse: InvitationResponseDto = {
        id: "1",
        bandId: "band-123",
        userId: "1",
        status: InvitationStatus.ACCEPTED,
        createdAt: new Date(),
      };

      mockInvitationService.acceptInvitation.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.acceptInvitation(invitationId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockInvitationService.acceptInvitation).toHaveBeenCalledWith(
        mockUser,
        invitationId,
      );
    });
  });

  describe("declineInvitation", () => {
    it("should decline an invitation", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const invitationId = "1";

      const expectedResponse: InvitationResponseDto = {
        id: "1",
        bandId: "band-123",
        userId: "1",
        status: InvitationStatus.DECLINED,
        createdAt: new Date(),
      };

      mockInvitationService.declineInvitation.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.declineInvitation(invitationId, {
        user: mockUser,
      });

      expect(result).toEqual(expectedResponse);
      expect(mockInvitationService.declineInvitation).toHaveBeenCalledWith(
        mockUser,
        invitationId,
      );
    });
  });

  describe("getUserInvitations", () => {
    it("should return all invitations for a user", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const expectedResponse: InvitationResponseDto[] = [
        {
          id: "1",
          bandId: "band-123",
          userId: "1",
          status: InvitationStatus.PENDING,
          createdAt: new Date(),
        },
        {
          id: "2",
          bandId: "band-456",
          userId: "1",
          status: InvitationStatus.ACCEPTED,
          createdAt: new Date(),
        },
      ];

      mockInvitationService.getUserInvitations.mockResolvedValue(
        expectedResponse,
      );

      const result = await controller.getUserInvitations({ user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockInvitationService.getUserInvitations).toHaveBeenCalledWith(
        mockUser,
      );
    });
  });
});

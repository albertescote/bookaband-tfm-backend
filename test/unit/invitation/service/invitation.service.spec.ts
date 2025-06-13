import { Test, TestingModule } from "@nestjs/testing";
import { InvitationService } from "../../../../src/context/invitation/service/invitation.service";
import { InvitationRepository } from "../../../../src/context/invitation/infrastructure/invitation.repository";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { EventBus } from "../../../../src/context/shared/eventBus/domain/eventBus";
import { InvitationSentEvent } from "../../../../src/context/shared/eventBus/domain/invitationSent.event";
import { InvitationAcceptedEvent } from "../../../../src/context/shared/eventBus/domain/invitationAccepted.event";
import { InvitationDeclinedEvent } from "../../../../src/context/shared/eventBus/domain/invitationDeclined.event";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";
import { InvitationStatus } from "../../../../src/context/shared/domain/invitationStatus";
import { NotOwnerOfTheRequestedBandException } from "../../../../src/context/invitation/exception/notOwnerOfTheRequestedBandException";
import { UserEmailNotFoundException } from "../../../../src/context/invitation/exception/userEmailNotFoundException";
import { AlreadyMemberOfThisBandException } from "../../../../src/context/invitation/exception/alreadyMemberOfThisBandException";
import { InvitationAlreadySentException } from "../../../../src/context/invitation/exception/invitationAlreadySentException";
import { InvitationNotFoundException } from "../../../../src/context/invitation/exception/invitationNotFoundException";
import { NotOwnerOfTheRequestedInvitationException } from "../../../../src/context/invitation/exception/notOwnerOfTheRequestedInvitationException";
import { InvitationAlreadyProcessedException } from "../../../../src/context/invitation/exception/invitationAlreadyProcessedException";
import { UserNotFoundException } from "../../../../src/context/invitation/exception/userNotFoundException";
import { MissingUserInfoToJoinBandException } from "../../../../src/context/invitation/exception/missingUserInfoToJoinBandException";
import User from "../../../../src/context/shared/domain/user";
import Invitation from "../../../../src/context/invitation/domain/invitation";
import { UserInvitation } from "../../../../src/context/invitation/domain/userInvitation";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import InvitationId from "../../../../src/context/invitation/domain/invitationId";

describe("InvitationService", () => {
  let service: InvitationService;
  let repository: jest.Mocked<InvitationRepository>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;
  let eventBus: jest.Mocked<EventBus>;

  const mockBandMemberUserAuthInfo: UserAuthInfo = {
    id: UserId.generate().toPrimitive(),
    email: "test@example.com",
    role: Role.Musician,
  };

  const mockNewBandMemberUserAuthInfo: UserAuthInfo = {
    id: UserId.generate().toPrimitive(),
    email: "invited@example.com",
    role: Role.Musician,
  };

  const mockBandId = BandId.generate().toPrimitive();
  const mockInvitationId = InvitationId.generate().toPrimitive();

  const mockBandMemberUser = {
    id: mockBandMemberUserAuthInfo.id,
    firstName: "John",
    familyName: "Doe",
    email: mockBandMemberUserAuthInfo.email,
    role: Role.Musician,
    emailVerified: true,
    joinedDate: new Date().toISOString(),
    phoneNumber: "123456789",
    nationalId: "12345678A",
  };

  const mockNewBandMemberUser = {
    id: mockNewBandMemberUserAuthInfo.id,
    firstName: "Emma",
    familyName: "White",
    email: mockNewBandMemberUserAuthInfo.email,
    role: Role.Musician,
    emailVerified: true,
    joinedDate: new Date().toISOString(),
    phoneNumber: "123456789",
    nationalId: "12345678A",
  };

  const mockInvitation = {
    id: mockInvitationId,
    bandId: mockBandId,
    userId: mockNewBandMemberUserAuthInfo.id,
    status: InvitationStatus.PENDING,
    createdAt: new Date(),
  };

  const mockUserInvitation: UserInvitation = {
    ...mockInvitation,
    bandName: "Test Band",
  };

  beforeEach(async () => {
    repository = {
      save: jest.fn(),
      findById: jest.fn(),
      findPendingInvitationByBandAndUser: jest.fn(),
      findByUser: jest.fn(),
    } as any;

    moduleConnectors = {
      obtainBandMembers: jest.fn(),
      obtainUserInformation: jest.fn(),
      joinBand: jest.fn(),
    } as any;

    eventBus = {
      publish: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: InvitationRepository,
          useValue: repository,
        },
        {
          provide: ModuleConnectors,
          useValue: moduleConnectors,
        },
        {
          provide: "EventBus",
          useValue: eventBus,
        },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
  });

  describe("sendInvitation", () => {
    it("should send an invitation successfully", async () => {
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockBandMemberUserAuthInfo.id,
      ]);
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives(mockNewBandMemberUser),
      );
      repository.findPendingInvitationByBandAndUser.mockResolvedValue(
        undefined,
      );
      repository.save.mockResolvedValue(
        Invitation.fromPrimitives(mockInvitation),
      );

      const result = await service.sendInvitation(
        mockBandMemberUserAuthInfo,
        mockBandId,
        mockNewBandMemberUserAuthInfo.email,
      );

      expect(result).toEqual(mockInvitation);
      expect(moduleConnectors.obtainBandMembers).toHaveBeenCalledWith(
        mockBandId,
      );
      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        undefined,
        mockNewBandMemberUserAuthInfo.email,
      );
      expect(repository.findPendingInvitationByBandAndUser).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(InvitationSentEvent),
      );
    });

    it("should throw NotOwnerOfTheRequestedBandException when user is not a band member", async () => {
      moduleConnectors.obtainBandMembers.mockResolvedValue([]);

      await expect(
        service.sendInvitation(
          mockBandMemberUserAuthInfo,
          mockBandId,
          mockNewBandMemberUserAuthInfo.email,
        ),
      ).rejects.toThrow(NotOwnerOfTheRequestedBandException);
    });

    it("should throw UserEmailNotFoundException when user is not found", async () => {
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockBandMemberUserAuthInfo.id,
      ]);
      moduleConnectors.obtainUserInformation.mockResolvedValue(undefined);

      await expect(
        service.sendInvitation(
          mockBandMemberUserAuthInfo,
          mockBandId,
          mockNewBandMemberUserAuthInfo.email,
        ),
      ).rejects.toThrow(UserEmailNotFoundException);
    });

    it("should throw AlreadyMemberOfThisBandException when user is already a band member", async () => {
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockBandMemberUserAuthInfo.id,
        mockNewBandMemberUserAuthInfo.id,
      ]);
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives(mockNewBandMemberUser),
      );

      await expect(
        service.sendInvitation(
          mockBandMemberUserAuthInfo,
          mockBandId,
          mockNewBandMemberUserAuthInfo.email,
        ),
      ).rejects.toThrow(AlreadyMemberOfThisBandException);
    });

    it("should throw InvitationAlreadySentException when invitation already exists", async () => {
      moduleConnectors.obtainBandMembers.mockResolvedValue([
        mockBandMemberUserAuthInfo.id,
      ]);
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives(mockNewBandMemberUser),
      );
      repository.findPendingInvitationByBandAndUser.mockResolvedValue(
        Invitation.fromPrimitives(mockInvitation),
      );

      await expect(
        service.sendInvitation(
          mockBandMemberUserAuthInfo,
          mockBandId,
          mockNewBandMemberUser.email,
        ),
      ).rejects.toThrow(InvitationAlreadySentException);
    });
  });

  describe("acceptInvitation", () => {
    it("should accept an invitation successfully", async () => {
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives(mockInvitation),
      );
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives(mockNewBandMemberUser),
      );
      repository.save.mockResolvedValue(
        Invitation.fromPrimitives({
          ...mockInvitation,
          status: InvitationStatus.ACCEPTED,
        }),
      );

      const result = await service.acceptInvitation(
        mockNewBandMemberUserAuthInfo,
        mockInvitationId,
      );

      expect(result.status).toBe(InvitationStatus.ACCEPTED);
      expect(repository.findById).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(moduleConnectors.joinBand).toHaveBeenCalledWith(
        mockBandId,
        mockNewBandMemberUser.id,
      );
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(InvitationAcceptedEvent),
      );
    });

    it("should throw InvitationNotFoundException when invitation is not found", async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.acceptInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(InvitationNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedInvitationException when user is not the invitation owner", async () => {
      const differentUserId = UserId.generate().toPrimitive();
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives({
          ...mockInvitation,
          userId: differentUserId,
        }),
      );

      await expect(
        service.acceptInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(NotOwnerOfTheRequestedInvitationException);
    });

    it("should throw InvitationAlreadyProcessedException when invitation is not pending", async () => {
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives({
          ...mockInvitation,
          status: InvitationStatus.ACCEPTED,
        }),
      );

      await expect(
        service.acceptInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(InvitationAlreadyProcessedException);
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives(mockInvitation),
      );
      moduleConnectors.obtainUserInformation.mockResolvedValue(undefined);

      await expect(
        service.acceptInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(UserNotFoundException);
    });

    it("should throw MissingUserInfoToJoinBandException when user info is incomplete", async () => {
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives(mockInvitation),
      );
      const incompleteUser = User.fromPrimitives({
        ...mockNewBandMemberUser,
        phoneNumber: undefined,
        nationalId: undefined,
      });
      moduleConnectors.obtainUserInformation.mockResolvedValue(incompleteUser);

      await expect(
        service.acceptInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(MissingUserInfoToJoinBandException);
    });
  });

  describe("declineInvitation", () => {
    it("should decline an invitation successfully", async () => {
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives(mockInvitation),
      );
      moduleConnectors.obtainUserInformation.mockResolvedValue(
        User.fromPrimitives(mockNewBandMemberUser),
      );
      repository.save.mockResolvedValue(
        Invitation.fromPrimitives({
          ...mockInvitation,
          status: InvitationStatus.DECLINED,
        }),
      );

      const result = await service.declineInvitation(
        mockNewBandMemberUserAuthInfo,
        mockInvitationId,
      );

      expect(result.status).toBe(InvitationStatus.DECLINED);
      expect(repository.findById).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(eventBus.publish).toHaveBeenCalledWith(
        expect.any(InvitationDeclinedEvent),
      );
    });

    it("should throw InvitationNotFoundException when invitation is not found", async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(
        service.declineInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(InvitationNotFoundException);
    });

    it("should throw NotOwnerOfTheRequestedInvitationException when user is not the invitation owner", async () => {
      const differentUserId = UserId.generate().toPrimitive();
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives({
          ...mockInvitation,
          userId: differentUserId,
        }),
      );

      await expect(
        service.declineInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(NotOwnerOfTheRequestedInvitationException);
    });

    it("should throw InvitationAlreadyProcessedException when invitation is not pending", async () => {
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives({
          ...mockInvitation,
          status: InvitationStatus.DECLINED,
        }),
      );

      await expect(
        service.declineInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(InvitationAlreadyProcessedException);
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      repository.findById.mockResolvedValue(
        Invitation.fromPrimitives(mockInvitation),
      );
      moduleConnectors.obtainUserInformation.mockResolvedValue(undefined);

      await expect(
        service.declineInvitation(
          mockNewBandMemberUserAuthInfo,
          mockInvitationId,
        ),
      ).rejects.toThrow(UserNotFoundException);
    });
  });

  describe("getUserInvitations", () => {
    it("should return user invitations", async () => {
      repository.findByUser.mockResolvedValue([mockUserInvitation]);

      const result = await service.getUserInvitations(
        mockNewBandMemberUserAuthInfo,
      );

      expect(result).toEqual([mockUserInvitation]);
      expect(repository.findByUser).toHaveBeenCalled();
    });

    it("should return empty array when no invitations found", async () => {
      repository.findByUser.mockResolvedValue([]);

      const result = await service.getUserInvitations(
        mockNewBandMemberUserAuthInfo,
      );

      expect(result).toEqual([]);
      expect(repository.findByUser).toHaveBeenCalled();
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { GenerateContractCommandHandler } from "../../../../src/context/contract/service/generateContract.commandHandler";
import { GenerateContractCommand } from "../../../../src/context/contract/service/generateContract.command";
import { ContractService } from "../../../../src/context/contract/service/contract.service";
import { ModuleConnectors } from "../../../../src/context/shared/infrastructure/moduleConnectors";
import { VidsignerApiWrapper } from "../../../../src/context/contract/infrastructure/vidsignerApiWrapper";
import { BookingNotFoundException } from "../../../../src/context/contract/exceptions/bookingNotFoundException";
import { BandNotFoundException } from "../../../../src/context/contract/exceptions/bandNotFoundException";
import { UserNotFoundException } from "../../../../src/context/contract/exceptions/userNotFoundException";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { Role } from "../../../../src/context/shared/domain/role";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import User from "../../../../src/context/shared/domain/user";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import { EXTERNAL_URL } from "../../../../src/config";
import { WeeklyAvailability } from "../../../../src/context/band/domain/band";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";

jest.mock("pdf-lib", () => ({
  PDFDocument: {
    create: jest.fn().mockResolvedValue({
      addPage: jest.fn().mockReturnValue({
        getSize: jest.fn().mockReturnValue({ height: 841.89 }),
        drawText: jest.fn(),
      }),
      save: jest.fn().mockResolvedValue(new Uint8Array()),
    }),
  },
  rgb: jest.fn(),
}));

describe("GenerateContractCommandHandler", () => {
  let handler: GenerateContractCommandHandler;
  let contractService: jest.Mocked<ContractService>;
  let moduleConnectors: jest.Mocked<ModuleConnectors>;
  let vidsignerApiWrapper: jest.Mocked<VidsignerApiWrapper>;

  const mockBookingId = BookingId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();
  const mockAdminId = UserId.generate().toPrimitive();
  const mockClientId = UserId.generate().toPrimitive();
  const mockDocGui = "test-doc-gui";

  const mockUserAuthInfo: UserAuthInfo = {
    id: mockUserId,
    role: Role.Musician,
    email: "test@example.com",
  };

  const mockBooking = {
    id: mockBookingId,
    bandId: mockBandId,
    userId: mockClientId,
    status: BookingStatus.PENDING,
    initDate: new Date(),
    endDate: new Date(),
    name: "Test Event",
    country: "Test Country",
    city: "Test City",
    venue: "Test Venue",
    postalCode: "12345",
    addressLine1: "Test Address 1",
    addressLine2: "Test Address 2",
    eventTypeId: "test-event-type-id",
    isPublic: true,
    cost: 1000,
  };

  const mockWeeklyAvailability: WeeklyAvailability = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  };

  const mockBand = {
    id: mockBandId,
    name: "Test Band",
    members: [
      {
        id: mockUserId,
        role: BandRole.MEMBER,
      },
      {
        id: mockAdminId,
        role: BandRole.ADMIN,
      },
    ],
    musicalStyleIds: ["test-style-id"],
    reviewCount: 0,
    followers: 0,
    following: 0,
    createdAt: new Date(),
    price: 1000,
    location: "Test Location",
    bandSize: "test-size",
    eventTypeIds: ["test-event-type-id"],
    featured: false,
    visible: true,
    weeklyAvailability: mockWeeklyAvailability,
    hospitalityRider: {
      accommodation: "Test Accommodation",
      catering: "Test Catering",
      beverages: "Test Beverages",
      specialRequirements: "Test Requirements",
    },
    technicalRider: {
      soundSystem: "Test Sound System",
      microphones: "Test Microphones",
      backline: "Test Backline",
      lighting: "Test Lighting",
      otherRequirements: "Test Requirements",
    },
    performanceArea: {
      regions: ["Test Region"],
      travelPreferences: "Test Preferences",
      restrictions: "Test Restrictions",
    },
    media: [],
    socialLinks: [],
  };

  const mockUser = {
    getId: jest.fn().mockReturnValue({ toPrimitive: () => mockUserId }),
    getFullName: jest.fn().mockReturnValue("Test User"),
    getNationalId: jest.fn().mockReturnValue("12345678A"),
    getPhoneNumber: jest.fn().mockReturnValue("123456789"),
    getEmail: jest.fn().mockReturnValue("test@example.com"),
    toPrimitives: jest.fn().mockReturnValue({
      firstName: "Test",
      familyName: "User",
    }),
  } as unknown as User;

  const mockClientUser = {
    getId: jest.fn().mockReturnValue({ toPrimitive: () => mockClientId }),
    getFullName: jest.fn().mockReturnValue("Test Client"),
    getNationalId: jest.fn().mockReturnValue("87654321B"),
    getPhoneNumber: jest.fn().mockReturnValue("987654321"),
    getEmail: jest.fn().mockReturnValue("client@example.com"),
    toPrimitives: jest.fn().mockReturnValue({
      firstName: "Test",
      familyName: "Client",
    }),
  } as unknown as User;

  const mockAdminUser = {
    getId: jest.fn().mockReturnValue({ toPrimitive: () => mockAdminId }),
    getFullName: jest.fn().mockReturnValue("Test Admin"),
    getNationalId: jest.fn().mockReturnValue("11223344C"),
    getPhoneNumber: jest.fn().mockReturnValue("112233445"),
    getEmail: jest.fn().mockReturnValue("admin@example.com"),
    toPrimitives: jest.fn().mockReturnValue({
      firstName: "Test",
      familyName: "Admin",
    }),
  } as unknown as User;

  beforeEach(async () => {
    contractService = {
      create: jest.fn(),
    } as any;

    moduleConnectors = {
      getBookingById: jest.fn(),
      getBandById: jest.fn(),
      obtainUserInformation: jest.fn(),
      storeFile: jest.fn(),
    } as any;

    vidsignerApiWrapper = {
      signDocument: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateContractCommandHandler,
        {
          provide: ContractService,
          useValue: contractService,
        },
        {
          provide: ModuleConnectors,
          useValue: moduleConnectors,
        },
        {
          provide: VidsignerApiWrapper,
          useValue: vidsignerApiWrapper,
        },
      ],
    }).compile();

    handler = module.get<GenerateContractCommandHandler>(
      GenerateContractCommandHandler,
    );
  });

  describe("execute", () => {
    it("should successfully generate a contract when user is a band member", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);
      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      moduleConnectors.obtainUserInformation
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(mockClientUser);
      moduleConnectors.storeFile.mockResolvedValue(undefined);
      vidsignerApiWrapper.signDocument.mockResolvedValue({
        DocGUI: mockDocGui,
      });
      contractService.create.mockResolvedValue(undefined);

      const command = new GenerateContractCommand(
        mockBookingId,
        mockBandId,
        mockUserAuthInfo,
      );
      await handler.execute(command);

      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(mockBandId);
      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledTimes(3);
      expect(moduleConnectors.storeFile).toHaveBeenCalled();
      expect(vidsignerApiWrapper.signDocument).toHaveBeenCalled();
      expect(contractService.create).toHaveBeenCalledWith(mockUserAuthInfo, {
        bookingId: mockBookingId,
        fileUrl: `${EXTERNAL_URL}/files/contract-${mockBookingId}-${now}.pdf`,
        vidsignerDocGui: mockDocGui,
      });
    });

    it("should successfully generate a contract when user is a band admin", async () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);
      const adminAuthInfo = { ...mockUserAuthInfo, id: mockAdminId };
      const bandWithAdminMember = {
        ...mockBand,
        members: [
          {
            id: mockAdminId,
            role: BandRole.ADMIN,
          },
        ],
      };

      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(bandWithAdminMember);
      moduleConnectors.obtainUserInformation
        .mockResolvedValueOnce(mockAdminUser)
        .mockResolvedValueOnce(mockClientUser);
      moduleConnectors.storeFile.mockResolvedValue(undefined);
      vidsignerApiWrapper.signDocument.mockResolvedValue({
        DocGUI: mockDocGui,
      });
      contractService.create.mockResolvedValue(undefined);

      const command = new GenerateContractCommand(
        mockBookingId,
        mockBandId,
        adminAuthInfo,
      );
      await handler.execute(command);

      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(mockBandId);
      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledTimes(2);
      expect(moduleConnectors.storeFile).toHaveBeenCalled();
      expect(vidsignerApiWrapper.signDocument).toHaveBeenCalled();
      expect(contractService.create).toHaveBeenCalledWith(adminAuthInfo, {
        bookingId: mockBookingId,
        fileUrl: `${EXTERNAL_URL}/files/contract-${mockBookingId}-${now}.pdf`,
        vidsignerDocGui: mockDocGui,
      });
    });

    it("should throw BookingNotFoundException when booking is not found", async () => {
      moduleConnectors.getBookingById.mockResolvedValue(null);

      const command = new GenerateContractCommand(
        mockBookingId,
        mockBandId,
        mockUserAuthInfo,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        BookingNotFoundException,
      );
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(moduleConnectors.getBandById).not.toHaveBeenCalled();
    });

    it("should throw BandNotFoundException when band is not found", async () => {
      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(null);

      const command = new GenerateContractCommand(
        mockBookingId,
        mockBandId,
        mockUserAuthInfo,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        BandNotFoundException,
      );
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(mockBandId);
    });

    it("should throw UserNotFoundException when user is not found", async () => {
      moduleConnectors.getBookingById.mockResolvedValue(mockBooking);
      moduleConnectors.getBandById.mockResolvedValue(mockBand);
      moduleConnectors.obtainUserInformation.mockResolvedValue(null);

      const command = new GenerateContractCommand(
        mockBookingId,
        mockBandId,
        mockUserAuthInfo,
      );

      await expect(handler.execute(command)).rejects.toThrow(
        UserNotFoundException,
      );
      expect(moduleConnectors.getBookingById).toHaveBeenCalledWith(
        mockBookingId,
      );
      expect(moduleConnectors.getBandById).toHaveBeenCalledWith(mockBandId);
      expect(moduleConnectors.obtainUserInformation).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });
});

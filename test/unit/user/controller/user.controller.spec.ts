import { Test, TestingModule } from "@nestjs/testing";
import { UserController } from "../../../../src/app/api/user/user.controller";
import { UserService } from "../../../../src/context/user/service/user.service";
import { CreateUserRequestDto } from "../../../../src/app/api/user/createUserRequest.dto";
import { UpdateUserRequestDto } from "../../../../src/app/api/user/updateUserRequest.dto";
import { UserResponseDto } from "../../../../src/app/api/user/userResponse.dto";
import { UserProfileDetailsResponseDto } from "../../../../src/app/api/user/userProfileDetailsResponse.dto";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { Role } from "../../../../src/context/shared/domain/role";

describe("UserController", () => {
  let controller: UserController;

  const mockUserService = {
    create: jest.fn(),
    getById: jest.fn(),
    getUserProfileDetails: jest.fn(),
    getAll: jest.fn(),
    updatePassword: jest.fn(),
    requestResetPassword: jest.fn(),
    update: jest.fn(),
    deleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const createUserDto: CreateUserRequestDto = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        familyName: "User",
        role: Role.Client,
        lng: undefined,
        bio: undefined,
      };

      const expectedResponse: UserResponseDto = {
        id: "1",
        email: "test@example.com",
        firstName: "Test",
        familyName: "User",
        role: Role.Client,
        emailVerified: false,
      };

      mockUserService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe("getById", () => {
    it("should return user by id", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const expectedResponse: UserResponseDto = {
        id: "1",
        email: "test@example.com",
        firstName: "Test",
        familyName: "User",
        role: Role.Client,
        emailVerified: false,
      };

      mockUserService.getById.mockResolvedValue(expectedResponse);

      const result = await controller.getById({ user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockUserService.getById).toHaveBeenCalledWith(mockUser);
    });
  });

  describe("getUserProfileDetails", () => {
    it("should return user profile details", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const expectedResponse: UserProfileDetailsResponseDto = {
        id: "1",
        email: "test@example.com",
        firstName: "Test",
        familyName: "User",
        role: Role.Client,
        joinedDate: new Date(),
        paymentMethods: [],
        activitySummary: {
          musiciansContacted: 0,
          eventsOrganized: 0,
        },
      };

      mockUserService.getUserProfileDetails.mockResolvedValue(expectedResponse);

      const result = await controller.getUserProfileDetails({ user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockUserService.getUserProfileDetails).toHaveBeenCalledWith(
        mockUser,
      );
    });
  });

  describe("update", () => {
    it("should update user", async () => {
      const mockUser: UserAuthInfo = {
        id: "1",
        email: "test@example.com",
        role: Role.Client,
      };

      const updateUserDto: UpdateUserRequestDto = {
        firstName: "Updated",
        familyName: "Name",
      };

      const expectedResponse: UserResponseDto = {
        id: "1",
        email: "test@example.com",
        firstName: "Updated",
        familyName: "Name",
        role: Role.Client,
        emailVerified: false,
      };

      mockUserService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(updateUserDto, { user: mockUser });

      expect(result).toEqual(expectedResponse);
      expect(mockUserService.update).toHaveBeenCalledWith(
        mockUser,
        updateUserDto,
      );
    });
  });
});

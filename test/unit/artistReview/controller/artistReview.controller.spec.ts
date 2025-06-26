import { Test, TestingModule } from "@nestjs/testing";
import { ArtistReviewController } from "../../../../src/app/api/artistReview/artistReview.controller";
import { CreateArtistReviewRequestDto } from "../../../../src/app/api/artistReview/createArtistReviewRequest.dto";
import { CommandBus } from "@nestjs/cqrs";
import { CreateArtistReviewCommand } from "../../../../src/context/artistReview/service/createArtistReview.command";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import UserId from "../../../../src/context/shared/domain/userId";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("ArtistReviewController", () => {
  let controller: ArtistReviewController;
  let commandBus: jest.Mocked<CommandBus>;

  const mockUserAuthInfo: UserAuthInfo = {
    id: UserId.generate().toPrimitive(),
    email: "test@example.com",
    role: "Client",
  };

  const mockCreateArtistReviewRequest: CreateArtistReviewRequestDto = {
    bookingId: BookingId.generate().toPrimitive(),
    rating: 5,
    comment: "Great performance!",
  };

  const mockRequest = {
    user: mockUserAuthInfo,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistReviewController],
      providers: [
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ArtistReviewController>(ArtistReviewController);
    commandBus = module.get(CommandBus);
  });

  describe("createArtistReview", () => {
    it("should create an artist review successfully", async () => {
      commandBus.execute.mockResolvedValue(undefined);

      await controller.createArtistReview(
        mockCreateArtistReviewRequest,
        mockRequest,
      );

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateArtistReviewCommand(
          mockCreateArtistReviewRequest.bookingId,
          mockCreateArtistReviewRequest.rating,
          mockCreateArtistReviewRequest.comment,
          mockUserAuthInfo,
        ),
      );
    });

    it("should handle command bus errors gracefully", async () => {
      const errorMessage = "Command execution failed";
      commandBus.execute.mockRejectedValue(new Error(errorMessage));

      await expect(
        controller.createArtistReview(
          mockCreateArtistReviewRequest,
          mockRequest,
        ),
      ).rejects.toThrow(errorMessage);

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateArtistReviewCommand(
          mockCreateArtistReviewRequest.bookingId,
          mockCreateArtistReviewRequest.rating,
          mockCreateArtistReviewRequest.comment,
          mockUserAuthInfo,
        ),
      );
    });
  });
});

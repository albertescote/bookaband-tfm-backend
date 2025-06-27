import { Test, TestingModule } from "@nestjs/testing";
import { ArtistReviewController } from "../../../../src/app/api/artistReview/artistReview.controller";
import { CreateArtistReviewRequestDto } from "../../../../src/app/api/artistReview/createArtistReviewRequest.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateArtistReviewCommand } from "../../../../src/context/artistReview/service/createArtistReview.command";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import UserId from "../../../../src/context/shared/domain/userId";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import { ArtistReviewId } from "../../../../src/context/artistReview/domain/artistReviewId";
import BandId from "../../../../src/context/shared/domain/bandId";
import { GetReviewByBookingIdQuery } from "../../../../src/context/artistReview/service/getReviewByBookingId.query";
import { ArtistReviewPrimitives } from "../../../../src/context/artistReview/domain/artistReview";

describe("ArtistReviewController", () => {
  let controller: ArtistReviewController;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

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
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ArtistReviewController>(ArtistReviewController);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
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
  describe("getReviewByBookingId", () => {
    const mockBookingId = BookingId.generate().toPrimitive();
    const mockArtistReviewPrimitives: ArtistReviewPrimitives = {
      id: ArtistReviewId.generate().toPrimitive(),
      userId: mockUserAuthInfo.id,
      bandId: BandId.generate().toPrimitive(),
      bookingId: mockBookingId,
      rating: 5,
      comment: "Great performance!",
      date: new Date(),
    };
    it("should return an artist review when it exists", async () => {
      queryBus.execute.mockResolvedValue(mockArtistReviewPrimitives);

      const result = await controller.getReviewByBookingId(mockBookingId, {
        user: mockUserAuthInfo,
      });

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetReviewByBookingIdQuery(mockBookingId, mockUserAuthInfo),
      );
      expect(result).toBe(mockArtistReviewPrimitives);
    });

    it("should return null when no review exists", async () => {
      queryBus.execute.mockResolvedValue(undefined);

      const result = await controller.getReviewByBookingId(mockBookingId, {
        user: mockUserAuthInfo,
      });

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetReviewByBookingIdQuery(mockBookingId, mockUserAuthInfo),
      );
      expect(result).toBeNull();
    });
  });
});

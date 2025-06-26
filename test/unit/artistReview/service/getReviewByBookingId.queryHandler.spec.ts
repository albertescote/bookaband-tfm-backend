import { GetReviewByBookingIdQueryHandler } from "../../../../src/context/artistReview/service/getReviewByBookingId.queryHandler";
import { GetReviewByBookingIdQuery } from "../../../../src/context/artistReview/service/getReviewByBookingId.query";
import { ArtistReviewRepository } from "../../../../src/context/artistReview/infrastructure/artistReview.repository";
import { ArtistReview } from "../../../../src/context/artistReview/domain/artistReview";
import { UserAuthInfo } from "../../../../src/context/shared/domain/userAuthInfo";
import { NotOwnerOfTheRequestedBookingException } from "../../../../src/context/artistReview/exceptions/notOwnerOfTheRequestedBookingException";
import BookingId from "../../../../src/context/shared/domain/bookingId";
import BandId from "../../../../src/context/shared/domain/bandId";
import UserId from "../../../../src/context/shared/domain/userId";
import { ArtistReviewId } from "../../../../src/context/artistReview/domain/artistReviewId";

describe("GetReviewByBookingIdQueryHandler", () => {
  let handler: GetReviewByBookingIdQueryHandler;
  let artistReviewRepository: jest.Mocked<ArtistReviewRepository>;

  const mockBookingId = BookingId.generate().toPrimitive();
  const mockBandId = BandId.generate().toPrimitive();
  const mockUserId = UserId.generate().toPrimitive();
  const mockUserAuthInfo: UserAuthInfo = {
    id: mockUserId,
    email: "test@example.com",
    role: "Client",
  };

  const mockQuery = new GetReviewByBookingIdQuery(
    mockBookingId,
    mockUserAuthInfo,
  );

  const mockArtistReview: ArtistReview = {
    toPrimitives: jest.fn().mockReturnValue({
      id: ArtistReviewId.generate().toPrimitive(),
      userId: mockUserId,
      bandId: mockBandId,
      bookingId: mockBookingId,
      rating: 5,
      comment: "Great performance!",
      date: new Date(),
    }),
  } as unknown as ArtistReview;

  beforeEach(() => {
    artistReviewRepository = {
      getReviewByBookingId: jest.fn(),
    } as unknown as jest.Mocked<ArtistReviewRepository>;

    handler = new GetReviewByBookingIdQueryHandler(artistReviewRepository);
  });

  describe("execute", () => {
    it("should return an artist review when user owns the booking and review exists", async () => {
      artistReviewRepository.getReviewByBookingId.mockResolvedValue(
        mockArtistReview,
      );

      const result = await handler.execute(mockQuery);

      expect(artistReviewRepository.getReviewByBookingId).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
      expect(result).toBe(mockArtistReview);
    });

    it("should return undefined when no review exists", async () => {
      artistReviewRepository.getReviewByBookingId.mockResolvedValue(undefined);

      const result = await handler.execute(mockQuery);

      expect(artistReviewRepository.getReviewByBookingId).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
      expect(result).toBeUndefined();
    });

    it("should throw NotOwnerOfTheRequestedBookingException when user is not the booking owner", async () => {
      const differentUserId = UserId.generate().toPrimitive();
      const artistReviewWithDifferentUser: ArtistReview = {
        toPrimitives: jest.fn().mockReturnValue({
          id: ArtistReviewId.generate().toPrimitive(),
          userId: differentUserId,
          bandId: mockBandId,
          bookingId: mockBookingId,
          rating: 5,
          comment: "Great performance!",
          date: new Date(),
        }),
      } as unknown as ArtistReview;
      artistReviewRepository.getReviewByBookingId.mockResolvedValue(
        artistReviewWithDifferentUser,
      );

      await expect(handler.execute(mockQuery)).rejects.toThrow(
        NotOwnerOfTheRequestedBookingException,
      );
      expect(artistReviewRepository.getReviewByBookingId).toHaveBeenCalledWith(
        new BookingId(mockBookingId),
      );
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { GetBandProfileQueryHandler } from "../../../../src/context/band/service/getBandProfile.queryHandler";
import { BandRepository } from "../../../../src/context/band/infrastructure/band.repository";
import { GetBandProfileQuery } from "../../../../src/context/band/service/getBandProfile.query";
import { BandProfile } from "../../../../src/context/band/domain/bandProfile";
import { BandNotFoundException } from "../../../../src/context/band/exceptions/bandNotFoundException";
import { BandRole } from "../../../../src/context/band/domain/bandRole";
import { BandSize } from "../../../../src/context/band/domain/bandSize";
import { BookingStatus } from "../../../../src/context/shared/domain/bookingStatus";
import UserId from "../../../../src/context/shared/domain/userId";
import BandId from "../../../../src/context/shared/domain/bandId";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";
import BookingId from "../../../../src/context/shared/domain/bookingId";

describe("GetBandProfileQueryHandler", () => {
  let handler: GetBandProfileQueryHandler;
  let mockBandRepository: jest.Mocked<BandRepository>;

  const mockBandId = BandId.generate().toPrimitive();
  const mockMemberId = UserId.generate().toPrimitive();
  const mockNonMemberId = UserId.generate().toPrimitive();

  const mockBandProfile: BandProfile = {
    id: mockBandId,
    name: "Test Band",
    musicalStyleIds: [
      MusicalStyleId.generate().toPrimitive(),
      MusicalStyleId.generate().toPrimitive(),
    ],
    bookingDates: ["2024-03-20T00:00:00.000Z"],
    location: "Barcelona",
    featured: true,
    bandSize: BandSize.BAND,
    eventTypeIds: [
      EventTypeId.generate().toPrimitive(),
      EventTypeId.generate().toPrimitive(),
    ],
    reviewCount: 5,
    createdDate: new Date(),
    weeklyAvailability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
    hospitalityRider: {
      accommodation: "Hotel",
      catering: "Full catering",
      beverages: "All drinks included",
      specialRequirements: "Vegetarian options",
    },
    technicalRider: {
      soundSystem: "Full PA system",
      microphones: "4 wireless mics",
      backline: "Basic backline",
      lighting: "Basic stage lighting",
      otherRequirements: "Stage risers",
    },
    performanceArea: {
      regions: ["Barcelona", "Madrid"],
      travelPreferences: "Within 100km",
      restrictions: "No outdoor venues",
    },
    followers: 100,
    following: 50,
    reviews: [
      {
        id: "review-1",
        rating: 5,
        comment: "Great band!",
        reviewer: {
          name: "John Doe",
          imageUrl: "https://example.com/john.jpg",
        },
        date: "2024-03-20T00:00:00.000Z",
      },
    ],
    media: [
      {
        id: "media-1",
        url: "https://example.com/video.mp4",
        type: "video",
      },
    ],
    events: [
      {
        id: BookingId.generate().toPrimitive(),
        name: "Public Event",
        date: "2024-04-01T00:00:00.000Z",
        eventTypeId: "type-1",
        status: BookingStatus.ACCEPTED,
        city: "Barcelona",
        country: "Spain",
        venue: "Main Hall",
        isPublic: true,
      },
      {
        id: BookingId.generate().toPrimitive(),
        name: "Private Event",
        date: "2024-04-02T00:00:00.000Z",
        eventTypeId: "type-2",
        status: BookingStatus.ACCEPTED,
        city: "Madrid",
        country: "Spain",
        venue: "Private Club",
        isPublic: false,
      },
    ],
    socialLinks: [
      {
        id: "social-1",
        platform: "Instagram",
        url: "https://instagram.com/testband",
      },
    ],
    members: [
      {
        id: mockMemberId,
        role: BandRole.ADMIN,
        name: "John Doe",
        imageUrl: "https://example.com/john.jpg",
      },
    ],
    price: 1000,
    imageUrl: "https://example.com/band.jpg",
    rating: 4.5,
    bio: "A great test band",
  };

  beforeEach(async () => {
    mockBandRepository = {
      getBandProfileById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetBandProfileQueryHandler,
        {
          provide: BandRepository,
          useValue: mockBandRepository,
        },
      ],
    }).compile();

    handler = module.get<GetBandProfileQueryHandler>(
      GetBandProfileQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return full profile when user is a member", async () => {
      mockBandRepository.getBandProfileById.mockResolvedValue(mockBandProfile);

      const query = new GetBandProfileQuery(mockMemberId, mockBandId);
      const result = await handler.execute(query);

      expect(result).toEqual(mockBandProfile);
      expect(mockBandRepository.getBandProfileById).toHaveBeenCalled();
    });

    it("should return filtered profile when user is not a member", async () => {
      mockBandRepository.getBandProfileById.mockResolvedValue(mockBandProfile);

      const query = new GetBandProfileQuery(mockNonMemberId, mockBandId);
      const result = await handler.execute(query);

      const { members, events, ...expectedProfile } = mockBandProfile;
      expect(result).toEqual({
        ...expectedProfile,
        events: [mockBandProfile.events[0]],
      });
      expect(mockBandRepository.getBandProfileById).toHaveBeenCalled();
    });

    it("should throw BandNotFoundException when band is not found", async () => {
      mockBandRepository.getBandProfileById.mockResolvedValue(undefined);

      const query = new GetBandProfileQuery(mockMemberId, mockBandId);

      await expect(handler.execute(query)).rejects.toThrow(
        new BandNotFoundException(mockBandId),
      );
      expect(mockBandRepository.getBandProfileById).toHaveBeenCalled();
    });
  });
});

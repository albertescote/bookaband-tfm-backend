import { Test, TestingModule } from "@nestjs/testing";
import { OfferService } from "../../../../src/context/offer/service/offer.service";
import { OfferRepository } from "../../../../src/context/offer/infrastructure/offer.repository";
import { WrongPermissionsException } from "../../../../src/context/offer/exceptions/wrongPermissionsException";
import { NotAbleToExecuteOfferDbTransactionException } from "../../../../src/context/offer/exceptions/notAbleToExecuteOfferDbTransactionException";
import UserId from "../../../../src/context/shared/domain/userId";
import OfferId from "../../../../src/context/offer/domain/offerId";
import { OfferNotFoundException } from "../../../../src/context/offer/exceptions/offerNotFoundException";
import Offer from "../../../../src/context/offer/domain/offer";
import { Role } from "../../../../src/context/shared/domain/role";
import OfferPrice from "../../../../src/context/offer/domain/offerPrice";

describe("OfferService", () => {
  let service: OfferService;
  let offerRepository: OfferRepository;
  const userId = UserId.generate().toPrimitive();
  const offerId = OfferId.generate().toPrimitive();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferService,
        {
          provide: OfferRepository,
          useValue: {
            addOffer: jest.fn(),
            getOfferById: jest.fn(),
            getAllOffers: jest.fn(),
            updateOffer: jest.fn(),
            deleteOffer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
    offerRepository = module.get<OfferRepository>(OfferRepository);
  });

  describe("for create offer method", () => {
    it("should create a offer successfully", async () => {
      const request = {
        description: "Test Offer",
        price: 3600,
      };
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      const offerResponse = {
        id: OfferId.generate().toPrimitive(),
        description: "Test Offer",
        price: 3600,
        ownerId: userId,
      };
      (offerRepository.addOffer as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => offerResponse,
      });

      const result = await service.create(request, userAuthInfo);
      expect(offerRepository.addOffer).toHaveBeenCalledWith(
        new Offer(
          expect.any(OfferId),
          "Test Offer",
          new UserId(userId),
          new OfferPrice(3600),
        ),
      );
      expect(result).toEqual({
        id: offerResponse.id,
        description: "Test Offer",
        price: 3600,
      });
    });
    it("should throw WrongPermissionsException if user is not a musician", async () => {
      const request = {
        description: "Test Offer",
        price: 500,
      };
      const userAuthInfo = {
        email: "client@example.com",
        id: userId,
        role: Role.Client,
      };

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it("should throw NotAbleToExecuteOfferDbTransactionException if offer addition fails", async () => {
      const request = {
        description: "Test Offer",
        price: 500,
      };
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician,
      };
      (offerRepository.addOffer as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(NotAbleToExecuteOfferDbTransactionException);
    });
  });
  describe("for getById offer method", () => {
    it("should return offer by ID to the owner", () => {
      const offerResponse = {
        id: offerId,
        description: "Test Offer",
        price: 500,
        ownerId: userId,
      };
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician,
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => offerResponse,
      });

      const result = service.getById(offerId, userAuthInfo);

      expect(offerRepository.getOfferById).toHaveBeenCalledWith(
        new OfferId(offerId),
      );
      expect(result).toEqual(offerResponse);
    });
    it("should throw OfferNotFoundException if offer does not exist", () => {
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };

      expect(() => service.getById(offerId, userAuthInfo)).toThrow(
        OfferNotFoundException,
      );
    });
    it("should throw WrongPermissionsException the requester is not the owner nor the client", () => {
      const offerResponse = {
        id: offerId,
        description: "Test Offer",
        price: 500,
        ownerId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => offerResponse,
      });
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };

      expect(() => service.getById(offerId, userAuthInfo)).toThrow(
        WrongPermissionsException,
      );
    });
  });
  describe("for getAll offer methods", () => {
    it("should return all offers", () => {
      const offers = [
        {
          id: offerId,
          description: "Offer 1",
          ownerId: userId,
          price: 500,
        },
        {
          id: OfferId.generate().toPrimitive(),
          description: "Offer 2",
          ownerId: userId,
          price: 1200,
        },
      ];
      (offerRepository.getAllOffers as jest.Mock).mockReturnValueOnce(
        offers.map((offer) => ({ toPrimitives: () => offer })),
      );

      const result = service.getAll();

      expect(offerRepository.getAllOffers).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: offers[0].id,
          description: "Offer 1",
          price: 500,
        },
        {
          id: offers[1].id,
          description: "Offer 2",
          price: 1200,
        },
      ]);
    });
    it("should return an empty array if no offers are found", () => {
      (offerRepository.getAllOffers as jest.Mock).mockReturnValueOnce([]);

      const result = service.getAll();

      expect(offerRepository.getAllOffers).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
  describe("for update offer method", () => {
    it("should update offer successfully", async () => {
      const request = {
        description: "Updated Offer",
        price: 3600,
      };
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        description: "Old Offer",
        ownerId: userId,
        price: 400,
      };
      const updatedOffer = {
        id: offerId,
        ...request,
        ownerId: userId,
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      (offerRepository.updateOffer as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => updatedOffer,
      });

      const result = await service.update(offerId, request, userAuthInfo);

      expect(offerRepository.getOfferById).toHaveBeenCalledWith(
        new OfferId(offerId),
      );
      expect(offerRepository.updateOffer).toHaveBeenCalledWith(
        new OfferId(offerId),
        Offer.fromPrimitives(updatedOffer),
      );
      expect(result).toEqual({
        id: offerId,
        description: "Updated Offer",
        price: 3600,
      });
    });
    it("should throw OfferNotFoundException if offer does not exist", async () => {
      const request = {
        description: "Updated Offer",
        price: 500,
      };
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(OfferNotFoundException);
    });
    it("should throw WrongPermissionsException if user does not have permission to update", async () => {
      const request = {
        description: "Updated Offer",
        price: 500,
      };
      const userAuthInfo = {
        email: "client@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        description: "Old Offer",
        ownerId: UserId.generate().toPrimitive(),
        price: 500,
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it("should throw NotAbleToExecuteOfferDbTransactionException if update fails", async () => {
      const request = {
        description: "Updated Offer",
        price: 500,
      };
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        description: "Old Offer",
        ownerId: userId,
        price: 200,
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      (offerRepository.updateOffer as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(NotAbleToExecuteOfferDbTransactionException);
    });
  });
  describe("for delete offer method", () => {
    it("should delete offer successfully", () => {
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        description: "Old Offer",
        ownerId: userId,
        price: 500,
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      (offerRepository.deleteOffer as jest.Mock).mockReturnValueOnce(true);

      expect(() => service.deleteById(offerId, userAuthInfo)).not.toThrow();
      expect(offerRepository.getOfferById).toHaveBeenCalledWith(
        new OfferId(offerId),
      );
      expect(offerRepository.deleteOffer).toHaveBeenCalledWith(
        new OfferId(offerId),
      );
    });
    it("should throw OfferNotFoundException if offer does not exist", () => {
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);

      expect(() => service.deleteById(offerId, userAuthInfo)).toThrow(
        OfferNotFoundException,
      );
    });
    it("should throw WrongPermissionsException if user does not have permission to delete", () => {
      const userAuthInfo = {
        email: "client@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        description: "Old Offer",
        ownerId: UserId.generate().toPrimitive(),
        price: 500,
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });

      expect(() => service.deleteById(offerId, userAuthInfo)).toThrow(
        WrongPermissionsException,
      );
    });
    it("should throw NotAbleToExecuteOfferDbTransactionException if delete fails", () => {
      const userAuthInfo = {
        email: "musician@example.com",
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        description: "Old Offer",
        ownerId: userId,
        price: 500,
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      (offerRepository.deleteOffer as jest.Mock).mockReturnValueOnce(false);

      expect(() => service.deleteById(offerId, userAuthInfo)).toThrow(
        NotAbleToExecuteOfferDbTransactionException,
      );
    });
  });
});

import {Test, TestingModule} from '@nestjs/testing';
import {OfferService} from '../../../../src/context/offer/service/offer.service';
import {OfferRepository} from '../../../../src/context/offer/infrastructure/offerRepository';
import RsaSigner from '../../../../src/context/shared/infrastructure/rsaSigner';
import {ModuleConnectors} from '../../../../src/context/shared/infrastructure/moduleConnectors';
import {WrongPermissionsException} from '../../../../src/context/offer/exceptions/wrongPermissionsException';
import {
  NotAbleToExecuteOfferDbTransactionException
} from '../../../../src/context/offer/exceptions/notAbleToExecuteOfferDbTransactionException';
import UserId from '../../../../src/context/shared/domain/userId';
import OfferId from '../../../../src/context/offer/domain/offerId';
import {ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET,} from '../../../../src/context/offer/config';
import {SupportedAlgorithms} from '../../../../src/context/offer/domain/supportedAlgorithms';
import {OfferNotFoundException} from '../../../../src/context/offer/exceptions/offerNotFoundException';
import Offer from '../../../../src/context/offer/domain/offer';
import {Role} from '../../../../src/context/shared/domain/role';
import User from '../../../../src/context/shared/domain/user';
import {InvalidClientIdException} from '../../../../src/context/offer/exceptions/invalidClientIdException';
import {
  InvalidRoleForRequestedClientException
} from '../../../../src/context/offer/exceptions/invalidRoleForRequestedClientException';

describe('OfferService', () => {
  let service: OfferService;
  let offerRepository: OfferRepository;
  let rsaSigner: RsaSigner;
  let moduleConnectors: ModuleConnectors;
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
        {
          provide: RsaSigner,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ModuleConnectors,
          useValue: {
            obtainUserInformation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OfferService>(OfferService);
    offerRepository = module.get<OfferRepository>(OfferRepository);
    rsaSigner = module.get<RsaSigner>(RsaSigner);
    moduleConnectors = module.get<ModuleConnectors>(ModuleConnectors);
  });

  describe('for create offer method', () => {
    it('should create a offer successfully', async () => {
      const request = {
        topic: 'Test Offer',
        clientId: UserId.generate().toPrimitive(),
        expirationSeconds: 3600,
      };
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const owner = { getRole: () => 'Musician' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      const client = new User(
        new UserId(request.clientId),
        'John',
        'Doe',
        'client@example.com',
        '123456789',
        Role.Client,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(client);
      const offerResponse = {
        id: OfferId.generate().toPrimitive(),
        topic: 'Test Offer',
        signature: 'mockedSignature',
        ownerId: userId,
      };
      (offerRepository.addOffer as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => offerResponse,
      });
      (rsaSigner.sign as jest.Mock).mockReturnValueOnce('mockedSignature');

      const result = await service.create(request, userAuthInfo);

      expect(moduleConnectors.obtainUserInformation).toHaveBeenNthCalledWith(
        1,
        userAuthInfo.id,
      );
      expect(moduleConnectors.obtainUserInformation).toHaveBeenNthCalledWith(
        2,
        request.clientId,
      );
      expect(offerRepository.addOffer).toHaveBeenCalledWith(
        new Offer(
          expect.any(OfferId),
          'Test Offer',
          new UserId(userId),
          new UserId(request.clientId),
        ),
      );
      expect(rsaSigner.sign).toHaveBeenCalledWith({
        alg: SupportedAlgorithms.HS256,
        header: { alg: SupportedAlgorithms.HS256, typ: 'JWT' },
        payload: {
          app_key: ZOOM_MEETING_SDK_KEY,
          exp: expect.any(Number) as number,
          iat: expect.any(Number) as number,
          role_type: 1,
          tpc: 'Test Offer',
          version: 1,
        },
        secret: ZOOM_MEETING_SDK_SECRET,
      });
      expect(result).toEqual(offerResponse);
    });
    it('should throw WrongPermissionsException if user is not a musician', async () => {
      const request = {
        topic: 'Test Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'client@example.com',
        id: userId,
        role: Role.Client,
      };
      const user = { getRole: () => 'Client' };

      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        user,
      );

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it('should throw InvalidClientIdException if the client does not exists', async () => {
      const request = {
        topic: 'Test Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'client@example.com',
        id: userId,
        role: Role.Client,
      };
      const owner = { getRole: () => 'Musician' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(undefined);

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(InvalidClientIdException);
    });
    it('should throw InvalidRoleForRequestedClientException if the client does not have the role of client', async () => {
      const request = {
        topic: 'Test Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'client@example.com',
        id: userId,
        role: Role.Client,
      };
      const owner = { getRole: () => 'Musician' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        owner,
      );
      const client = { getRole: () => 'Musician' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        client,
      );

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(InvalidRoleForRequestedClientException);
    });
    it('should throw NotAbleToExecuteOfferDbTransactionException if offer addition fails', async () => {
      const request = {
        topic: 'Test Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const owner = { getRole: () => 'Musician' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      const client = { getRole: () => 'Client' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(client);
      (offerRepository.addOffer as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(NotAbleToExecuteOfferDbTransactionException);
    });
  });
  describe('for getById offer method', () => {
    it('should return offer by ID to the owner', () => {
      const offerResponse = {
        id: offerId,
        topic: 'Test Offer',
        ownerId: userId,
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
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
    it('should return offer by ID to the client', () => {
      const offerResponse = {
        id: offerId,
        topic: 'Test Offer',
        ownerId: userId,
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'musician@example.com',
        id: offerResponse.clientId,
        role: Role.Musician.toString(),
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
    it('should throw OfferNotFoundException if offer does not exist', () => {
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };

      expect(() => service.getById(offerId, userAuthInfo)).toThrow(
        OfferNotFoundException,
      );
    });
    it('should throw WrongPermissionsException the requester is not the owner nor the client', () => {
      const offerResponse = {
        id: offerId,
        topic: 'Test Offer',
        ownerId: UserId.generate().toPrimitive(),
        clientId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => offerResponse,
      });
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };

      expect(() => service.getById(offerId, userAuthInfo)).toThrow(
        WrongPermissionsException,
      );
    });
  });
  describe('for getAll offer methods', () => {
    it('should return all offers', () => {
      const offers = [
        {
          id: offerId,
          topic: 'Offer 1',
          ownerId: userId,
          clientId: UserId.generate().toPrimitive(),
        },
        {
          id: OfferId.generate().toPrimitive(),
          topic: 'Offer 2',
          ownerId: userId,
          clientId: UserId.generate().toPrimitive(),
        },
      ];
      (offerRepository.getAllOffers as jest.Mock).mockReturnValueOnce(
        offers.map((offer) => ({ toPrimitives: () => offer })),
      );
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };

      const result = service.getAll(userAuthInfo);

      expect(offerRepository.getAllOffers).toHaveBeenCalled();
      expect(result).toEqual(offers);
    });
    it('should return an empty array if no offers are found', () => {
      (offerRepository.getAllOffers as jest.Mock).mockReturnValueOnce([]);
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };

      const result = service.getAll(userAuthInfo);

      expect(offerRepository.getAllOffers).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
  describe('for update offer method', () => {
    it('should update offer successfully', async () => {
      const request = {
        topic: 'Updated Offer',
        clientId: UserId.generate().toPrimitive(),
        expirationSeconds: 3600,
      };
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
        clientId: UserId.generate().toPrimitive(),
      };
      const updatedOffer = {
        id: offerId,
        ...request,
        ownerId: userId,
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      const client = new User(
        new UserId(request.clientId),
        'John',
        'Doe',
        'client@example.com',
        '123456789',
        Role.Client,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(client);
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
      expect(result).toEqual(updatedOffer);
    });
    it('should throw OfferNotFoundException if offer does not exist', async () => {
      const request = {
        topic: 'Updated Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(OfferNotFoundException);
    });
    it('should throw WrongPermissionsException if user does not have permission to update', async () => {
      const request = {
        topic: 'Updated Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'client@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: UserId.generate().toPrimitive(),
        clientId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it('should throw InvalidClientIdException if the client does not exists', async () => {
      const request = {
        topic: 'Test Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'client@example.com',
        id: userId,
        role: Role.Client,
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
        clientId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(undefined);

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(InvalidClientIdException);
    });
    it('should throw InvalidRoleForRequestedClientException if the client does not have the role of client', async () => {
      const request = {
        topic: 'Test Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'client@example.com',
        id: userId,
        role: Role.Client,
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
        clientId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      const client = { getRole: () => 'Musician' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        client,
      );

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(InvalidRoleForRequestedClientException);
    });
    it('should throw NotAbleToExecuteOfferDbTransactionException if update fails', async () => {
      const request = {
        topic: 'Updated Offer',
        clientId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
      };
      const client = new User(
        new UserId(request.clientId),
        'John',
        'Doe',
        'client@example.com',
        '123456789',
        Role.Client,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(client);
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      (offerRepository.updateOffer as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(NotAbleToExecuteOfferDbTransactionException);
    });
  });
  describe('for delete offer method', () => {
    it('should delete offer successfully', () => {
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
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
    it('should throw OfferNotFoundException if offer does not exist', () => {
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);

      expect(() => service.deleteById(offerId, userAuthInfo)).toThrow(
        OfferNotFoundException,
      );
    });
    it('should throw WrongPermissionsException if user does not have permission to delete', () => {
      const userAuthInfo = {
        email: 'client@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: UserId.generate().toPrimitive(),
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });

      expect(() => service.deleteById(offerId, userAuthInfo)).toThrow(
        WrongPermissionsException,
      );
    });
    it('should throw NotAbleToExecuteOfferDbTransactionException if delete fails', () => {
      const userAuthInfo = {
        email: 'musician@example.com',
        id: userId,
        role: Role.Musician.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
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

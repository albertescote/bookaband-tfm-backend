import { Test, TestingModule } from '@nestjs/testing';
import { OfferService } from '../../../../src/context/offer/service/offer.service';
import { OfferRepository } from '../../../../src/context/offer/infrastructure/offerRepository';
import RsaSigner from '../../../../src/context/shared/infrastructure/rsaSigner';
import { ModuleConnectors } from '../../../../src/context/shared/infrastructure/moduleConnectors';
import { WrongPermissionsException } from '../../../../src/context/offer/exceptions/wrongPermissionsException';
import { NotAbleToExecuteOfferDbTransactionException } from '../../../../src/context/offer/exceptions/notAbleToExecuteOfferDbTransactionException';
import UserId from '../../../../src/context/shared/domain/userId';
import OfferId from '../../../../src/context/offer/domain/offerId';
import {
  ZOOM_MEETING_SDK_KEY,
  ZOOM_MEETING_SDK_SECRET,
} from '../../../../src/context/offer/config';
import { SupportedAlgorithms } from '../../../../src/context/offer/domain/supportedAlgorithms';
import { OfferNotFoundException } from '../../../../src/context/offer/exceptions/offerNotFoundException';
import Offer from '../../../../src/context/offer/domain/offer';
import { Role } from '../../../../src/context/shared/domain/role';
import User from '../../../../src/context/shared/domain/user';
import { InvalidStudentIdException } from '../../../../src/context/offer/exceptions/invalidStudentIdException';
import { InvalidRoleForRequestedStudentException } from '../../../../src/context/offer/exceptions/invalidRoleForRequestedStudentException';

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
        studentId: UserId.generate().toPrimitive(),
        expirationSeconds: 3600,
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const owner = { getRole: () => 'Teacher' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      const student = new User(
        new UserId(request.studentId),
        'John',
        'Doe',
        'student@example.com',
        '123456789',
        Role.Student,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
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
        request.studentId,
      );
      expect(offerRepository.addOffer).toHaveBeenCalledWith(
        new Offer(
          expect.any(OfferId),
          'Test Offer',
          new UserId(userId),
          new UserId(request.studentId),
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
    it('should throw WrongPermissionsException if user is not a teacher', async () => {
      const request = {
        topic: 'Test Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const user = { getRole: () => 'Student' };

      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        user,
      );

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it('should throw InvalidStudentIdException if the student does not exists', async () => {
      const request = {
        topic: 'Test Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const owner = { getRole: () => 'Teacher' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(undefined);

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(InvalidStudentIdException);
    });
    it('should throw InvalidRoleForRequestedStudentException if the student does not have the role of student', async () => {
      const request = {
        topic: 'Test Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const owner = { getRole: () => 'Teacher' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        owner,
      );
      const student = { getRole: () => 'Teacher' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        student,
      );

      await expect(
        async () => await service.create(request, userAuthInfo),
      ).rejects.toThrow(InvalidRoleForRequestedStudentException);
    });
    it('should throw NotAbleToExecuteOfferDbTransactionException if offer addition fails', async () => {
      const request = {
        topic: 'Test Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const owner = { getRole: () => 'Teacher' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(owner);
      const student = { getRole: () => 'Student' };
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
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
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
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
    it('should return offer by ID to the student', () => {
      const offerResponse = {
        id: offerId,
        topic: 'Test Offer',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: offerResponse.studentId,
        role: Role.Teacher.toString(),
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
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      expect(() => service.getById(offerId, userAuthInfo)).toThrow(
        OfferNotFoundException,
      );
    });
    it('should throw WrongPermissionsException the requester is not the owner nor the student', () => {
      const offerResponse = {
        id: offerId,
        topic: 'Test Offer',
        ownerId: UserId.generate().toPrimitive(),
        studentId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => offerResponse,
      });
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
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
          studentId: UserId.generate().toPrimitive(),
        },
        {
          id: OfferId.generate().toPrimitive(),
          topic: 'Offer 2',
          ownerId: userId,
          studentId: UserId.generate().toPrimitive(),
        },
      ];
      (offerRepository.getAllOffers as jest.Mock).mockReturnValueOnce(
        offers.map((offer) => ({ toPrimitives: () => offer })),
      );
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      const result = service.getAll(userAuthInfo);

      expect(offerRepository.getAllOffers).toHaveBeenCalled();
      expect(result).toEqual(offers);
    });
    it('should return an empty array if no offers are found', () => {
      (offerRepository.getAllOffers as jest.Mock).mockReturnValueOnce([]);
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
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
        studentId: UserId.generate().toPrimitive(),
        expirationSeconds: 3600,
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
      };
      const updatedOffer = {
        id: offerId,
        ...request,
        ownerId: userId,
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      const student = new User(
        new UserId(request.studentId),
        'John',
        'Doe',
        'student@example.com',
        '123456789',
        Role.Student,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
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
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };

      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(OfferNotFoundException);
    });
    it('should throw WrongPermissionsException if user does not have permission to update', async () => {
      const request = {
        topic: 'Updated Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: UserId.generate().toPrimitive(),
        studentId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(WrongPermissionsException);
    });
    it('should throw InvalidStudentIdException if the student does not exists', async () => {
      const request = {
        topic: 'Test Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(undefined);

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(InvalidStudentIdException);
    });
    it('should throw InvalidRoleForRequestedStudentException if the student does not have the role of student', async () => {
      const request = {
        topic: 'Test Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Student,
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
        studentId: UserId.generate().toPrimitive(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce({
        toPrimitives: () => oldOffer,
      });
      const student = { getRole: () => 'Teacher' };
      (moduleConnectors.obtainUserInformation as jest.Mock).mockResolvedValue(
        student,
      );

      await expect(
        async () => await service.update(offerId, request, userAuthInfo),
      ).rejects.toThrow(InvalidRoleForRequestedStudentException);
    });
    it('should throw NotAbleToExecuteOfferDbTransactionException if update fails', async () => {
      const request = {
        topic: 'Updated Offer',
        studentId: UserId.generate().toPrimitive(),
      };
      const userAuthInfo = {
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      const oldOffer = {
        id: offerId,
        topic: 'Old Offer',
        ownerId: userId,
      };
      const student = new User(
        new UserId(request.studentId),
        'John',
        'Doe',
        'student@example.com',
        '123456789',
        Role.Student,
      );
      (
        moduleConnectors.obtainUserInformation as jest.Mock
      ).mockResolvedValueOnce(student);
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
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
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
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
      };
      (offerRepository.getOfferById as jest.Mock).mockReturnValueOnce(null);

      expect(() => service.deleteById(offerId, userAuthInfo)).toThrow(
        OfferNotFoundException,
      );
    });
    it('should throw WrongPermissionsException if user does not have permission to delete', () => {
      const userAuthInfo = {
        email: 'student@example.com',
        id: userId,
        role: Role.Teacher.toString(),
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
        email: 'teacher@example.com',
        id: userId,
        role: Role.Teacher.toString(),
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

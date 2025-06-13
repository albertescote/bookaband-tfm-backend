import { Test, TestingModule } from "@nestjs/testing";
import { EventTypeService } from "../../../../src/context/eventType/service/eventType.service";
import { EventTypeRepository } from "../../../../src/context/eventType/infrastructure/eventType.repository";
import { EventType } from "../../../../src/context/shared/domain/eventType";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";
import { InvalidEventTypeIdFormatException } from "../../../../src/context/eventType/exceptions/invalidEventTypeIdFormatException";
import { InvalidEventTypeLabelException } from "../../../../src/context/eventType/exceptions/invalidEventTypeLabelException";

describe("EventTypeService", () => {
  let service: EventTypeService;
  let repository: EventTypeRepository;

  const mockEventType = {
    id: EventTypeId.generate().toPrimitive(),
    label: {
      en: "Weddings",
      es: "Bodas",
      ca: "Casaments",
    },
    icon: "💍",
  };

  const mockEventType2 = {
    id: EventTypeId.generate().toPrimitive(),
    label: {
      en: "Private Parties",
      es: "Fiestas Privadas",
      ca: "Festes Privades",
    },
    icon: "🎉",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventTypeService,
        {
          provide: EventTypeRepository,
          useValue: {
            create: jest.fn(),
            getById: jest.fn(),
            getAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventTypeService>(EventTypeService);
    repository = module.get<EventTypeRepository>(EventTypeRepository);
  });

  describe("create", () => {
    it("should create a new event type", async () => {
      const createRequest = {
        label: mockEventType.label,
        icon: mockEventType.icon,
      };

      const mockCreatedEventType = EventType.fromPrimitives(mockEventType);
      jest.spyOn(repository, "create").mockResolvedValue(mockCreatedEventType);

      const result = await service.create(createRequest);

      expect(result).toEqual(mockEventType);
      expect(repository.create).toHaveBeenCalled();
    });

    it("should throw InvalidEventTypeLabelException when label is empty", async () => {
      const createRequest = {
        label: {},
        icon: mockEventType.icon,
      };

      await expect(service.create(createRequest)).rejects.toThrow(
        InvalidEventTypeLabelException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should throw InvalidEventTypeLabelException when label has invalid language code", async () => {
      const createRequest = {
        label: {
          invalid: "Invalid Language",
        },
        icon: mockEventType.icon,
      };

      await expect(service.create(createRequest)).rejects.toThrow(
        InvalidEventTypeLabelException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it("should throw InvalidEventTypeLabelException when label has empty text", async () => {
      const createRequest = {
        label: {
          en: "",
        },
        icon: mockEventType.icon,
      };

      await expect(service.create(createRequest)).rejects.toThrow(
        InvalidEventTypeLabelException,
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return an event type by id", async () => {
      const mockFoundEventType = EventType.fromPrimitives(mockEventType);
      jest.spyOn(repository, "getById").mockResolvedValue(mockFoundEventType);

      const result = await service.getById(mockEventType.id);

      expect(result).toEqual(mockEventType);
      expect(repository.getById).toHaveBeenCalledWith(expect.any(EventTypeId));
    });

    it("should throw InvalidEventTypeIdFormatException when id is invalid", async () => {
      const invalidId = "invalid-id";

      await expect(service.getById(invalidId)).rejects.toThrow(
        InvalidEventTypeIdFormatException,
      );
      expect(repository.getById).not.toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("should return all event types", async () => {
      const mockEventTypes = [
        EventType.fromPrimitives(mockEventType),
        EventType.fromPrimitives(mockEventType2),
      ];
      jest.spyOn(repository, "getAll").mockResolvedValue(mockEventTypes);

      const result = await service.getAll();

      expect(result).toEqual([mockEventType, mockEventType2]);
      expect(repository.getAll).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update an event type", async () => {
      const updateRequest = {
        id: mockEventType.id,
        label: mockEventType.label,
        icon: mockEventType.icon,
      };

      const mockUpdatedEventType = EventType.fromPrimitives(mockEventType);
      jest.spyOn(repository, "update").mockResolvedValue(mockUpdatedEventType);

      const result = await service.update(updateRequest);

      expect(result).toEqual(mockEventType);
      expect(repository.update).toHaveBeenCalled();
    });

    it("should throw InvalidEventTypeIdFormatException when id is invalid", async () => {
      const updateRequest = {
        id: "invalid-id",
        label: mockEventType.label,
        icon: mockEventType.icon,
      };

      await expect(service.update(updateRequest)).rejects.toThrow(
        InvalidEventTypeIdFormatException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it("should throw InvalidEventTypeLabelException when label is empty", async () => {
      const updateRequest = {
        id: mockEventType.id,
        label: {},
        icon: mockEventType.icon,
      };

      await expect(service.update(updateRequest)).rejects.toThrow(
        InvalidEventTypeLabelException,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete an event type", async () => {
      jest.spyOn(repository, "delete").mockResolvedValue();

      await service.delete(mockEventType.id);

      expect(repository.delete).toHaveBeenCalledWith(expect.any(EventTypeId));
    });

    it("should throw InvalidEventTypeIdFormatException when id is invalid", async () => {
      const invalidId = "invalid-id";

      await expect(service.delete(invalidId)).rejects.toThrow(
        InvalidEventTypeIdFormatException,
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });
});

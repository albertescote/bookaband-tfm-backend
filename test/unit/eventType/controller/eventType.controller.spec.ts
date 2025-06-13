import { Test, TestingModule } from "@nestjs/testing";
import { EventTypeController } from "../../../../src/app/api/eventType/eventType.controller";
import { EventTypeService } from "../../../../src/context/eventType/service/eventType.service";
import { CreateEventTypeRequestDto } from "../../../../src/app/api/eventType/createEventType.dto";
import { UpdateEventTypeRequestDto } from "../../../../src/app/api/eventType/updateEventType.dto";

describe("EventTypeController", () => {
  let controller: EventTypeController;

  const mockEventTypeService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventTypeController],
      providers: [
        {
          provide: EventTypeService,
          useValue: mockEventTypeService,
        },
      ],
    }).compile();

    controller = module.get<EventTypeController>(EventTypeController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new event type", async () => {
      const createDto: CreateEventTypeRequestDto = {
        label: {
          en: "Wedding",
          es: "Boda",
        },
        icon: "wedding-icon",
      };

      const expectedResponse = {
        id: "1",
        ...createDto,
      };

      mockEventTypeService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResponse);
      expect(mockEventTypeService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe("getAll", () => {
    it("should return all event types", async () => {
      const expectedResponse = [
        {
          id: "1",
          label: {
            en: "Wedding",
            es: "Boda",
          },
          icon: "wedding-icon",
        },
        {
          id: "2",
          label: {
            en: "Birthday",
            es: "Cumpleaños",
          },
          icon: "birthday-icon",
        },
      ];

      mockEventTypeService.getAll.mockResolvedValue(expectedResponse);

      const result = await controller.getAll();

      expect(result).toEqual(expectedResponse);
      expect(mockEventTypeService.getAll).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return an event type by id", async () => {
      const eventTypeId = "1";
      const expectedResponse = {
        id: eventTypeId,
        label: {
          en: "Wedding",
          es: "Boda",
        },
        icon: "wedding-icon",
      };

      mockEventTypeService.getById.mockResolvedValue(expectedResponse);

      const result = await controller.getById(eventTypeId);

      expect(result).toEqual(expectedResponse);
      expect(mockEventTypeService.getById).toHaveBeenCalledWith(eventTypeId);
    });
  });

  describe("update", () => {
    it("should update an event type", async () => {
      const eventTypeId = "1";
      const updateDto: UpdateEventTypeRequestDto = {
        label: {
          en: "Wedding Party",
          es: "Fiesta de Boda",
        },
        icon: "wedding-party-icon",
      };

      const expectedResponse = {
        id: eventTypeId,
        ...updateDto,
      };

      mockEventTypeService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(eventTypeId, updateDto);

      expect(result).toEqual(expectedResponse);
      expect(mockEventTypeService.update).toHaveBeenCalledWith({
        ...updateDto,
        id: eventTypeId,
      });
    });
  });

  describe("delete", () => {
    it("should delete an event type", async () => {
      const eventTypeId = "1";

      await controller.delete(eventTypeId);

      expect(mockEventTypeService.delete).toHaveBeenCalledWith(eventTypeId);
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { GetAllEventTypesQueryHandler } from "../../../../src/context/eventType/service/getAllEventTypes.queryHandler";
import { EventTypeRepository } from "../../../../src/context/eventType/infrastructure/eventType.repository";
import { GetAllEventTypesQuery } from "../../../../src/context/eventType/service/getAllEventTypes.query";
import { EventType } from "../../../../src/context/shared/domain/eventType";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";
import { EventTypeLabel } from "../../../../src/context/eventType/domain/eventTypeLabel";
import { EventTypeIcon } from "../../../../src/context/eventType/domain/eventTypeIcon";

describe("GetAllEventTypesQueryHandler", () => {
  let handler: GetAllEventTypesQueryHandler;
  let mockEventTypeRepository: jest.Mocked<EventTypeRepository>;

  const eventTypeId1 = EventTypeId.generate();
  const eventTypeId2 = EventTypeId.generate();

  const mockEventTypes = [
    new EventType(
      eventTypeId1,
      new EventTypeLabel({ en: "Wedding", es: "Boda" }),
      new EventTypeIcon("🎉"),
    ),
    new EventType(
      eventTypeId2,
      new EventTypeLabel({ en: "Birthday", es: "Cumpleaños" }),
      new EventTypeIcon("🎂"),
    ),
  ];

  const expectedPrimitives = [
    {
      id: eventTypeId1.toPrimitive(),
      label: { en: "Wedding", es: "Boda" },
      icon: "🎉",
    },
    {
      id: eventTypeId2.toPrimitive(),
      label: { en: "Birthday", es: "Cumpleaños" },
      icon: "🎂",
    },
  ];

  beforeEach(async () => {
    mockEventTypeRepository = {
      getAll: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllEventTypesQueryHandler,
        {
          provide: EventTypeRepository,
          useValue: mockEventTypeRepository,
        },
      ],
    }).compile();

    handler = module.get<GetAllEventTypesQueryHandler>(
      GetAllEventTypesQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return all event types as primitives", async () => {
      mockEventTypeRepository.getAll.mockResolvedValue(mockEventTypes);

      const query = new GetAllEventTypesQuery();
      const result = await handler.execute(query);

      expect(result).toEqual(expectedPrimitives);
      expect(mockEventTypeRepository.getAll).toHaveBeenCalled();
    });

    it("should return undefined when no event types are found", async () => {
      mockEventTypeRepository.getAll.mockResolvedValue(undefined);

      const query = new GetAllEventTypesQuery();
      const result = await handler.execute(query);

      expect(result).toBeUndefined();
      expect(mockEventTypeRepository.getAll).toHaveBeenCalled();
    });

    it("should return empty array when repository returns empty array", async () => {
      mockEventTypeRepository.getAll.mockResolvedValue([]);

      const query = new GetAllEventTypesQuery();
      const result = await handler.execute(query);

      expect(result).toEqual([]);
      expect(mockEventTypeRepository.getAll).toHaveBeenCalled();
    });
  });
});

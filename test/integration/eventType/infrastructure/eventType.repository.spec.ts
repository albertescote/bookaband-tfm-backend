import { Test, TestingModule } from "@nestjs/testing";
import { EventTypeRepository } from "../../../../src/context/eventType/infrastructure/eventType.repository";
import { EventType } from "../../../../src/context/shared/domain/eventType";
import EventTypeId from "../../../../src/context/eventType/domain/eventTypeId";
import MongoCollectionService from "../../../../src/context/shared/infrastructure/db/mongoCollection.service";
import { MongoClient } from "mongodb";
import { MONGO_DB_URL, MONGODB_COLLECTIONS } from "../../../../src/config";
import MongoService from "../../../../src/context/shared/infrastructure/db/mongo.service";

describe("EventTypeRepository Integration Tests", () => {
  let repository: EventTypeRepository;
  let module: TestingModule;
  let mongoClient: MongoClient;
  let mongoService: MongoService;

  const testEventType = {
    id: EventTypeId.generate().toPrimitive(),
    label: {
      en: "Test Event Type",
      es: "Tipo de Evento de Prueba",
      ca: "Tipus d'Esdeveniment de Prova",
    },
    icon: "🎯",
  };

  beforeAll(async () => {
    mongoClient = new MongoClient(MONGO_DB_URL);
    await mongoClient.connect();

    module = await Test.createTestingModule({
      providers: [
        EventTypeRepository,
        MongoCollectionService,
        MongoService,
        {
          provide: MongoClient,
          useFactory: async () => {
            return new MongoClient(MONGO_DB_URL);
          },
        },
      ],
    }).compile();

    repository = module.get<EventTypeRepository>(EventTypeRepository);
    mongoService = module.get<MongoService>(MongoService);
  });

  afterAll(async () => {
    await mongoClient.close();
    await module.close();
  });

  beforeEach(async () => {
    const db = mongoService.getDatabase();
    await db
      .collection(MONGODB_COLLECTIONS.EVENT_TYPES)
      .drop()
      .catch(() => {});
    await db.createCollection(MONGODB_COLLECTIONS.EVENT_TYPES);
  });

  describe("create", () => {
    it("should create a new event type", async () => {
      const eventType = EventType.fromPrimitives(testEventType);
      const createdEventType = await repository.create(eventType);

      expect(createdEventType).toBeDefined();
      expect(createdEventType.toPrimitives()).toEqual(testEventType);

      const storedEventType = await repository.getById(
        new EventTypeId(eventType.toPrimitives().id),
      );
      expect(storedEventType.toPrimitives()).toEqual(testEventType);
    });
  });

  describe("getById", () => {
    it("should return an event type by id", async () => {
      const eventType = EventType.fromPrimitives(testEventType);
      await repository.create(eventType);

      const foundEventType = await repository.getById(
        new EventTypeId(testEventType.id),
      );

      expect(foundEventType).toBeDefined();
      expect(foundEventType.toPrimitives()).toEqual(testEventType);
    });

    it("should return undefined when event type does not exist", async () => {
      const nonExistentId = EventTypeId.generate();
      const foundEventType = await repository.getById(nonExistentId);

      expect(foundEventType).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("should return all event types", async () => {
      const eventType1 = EventType.fromPrimitives(testEventType);
      const eventType2 = EventType.fromPrimitives({
        id: EventTypeId.generate().toPrimitive(),
        label: {
          en: "Another Event Type",
          es: "Otro Tipo de Evento",
          ca: "Un altre Tipus d'Esdeveniment",
        },
        icon: "🎨",
      });

      await repository.create(eventType1);
      await repository.create(eventType2);

      const allEventTypes = await repository.getAll();

      expect(allEventTypes).toHaveLength(2);
      expect(allEventTypes.map((et) => et.toPrimitives())).toEqual([
        testEventType,
        eventType2.toPrimitives(),
      ]);
    });

    it("should return empty array when no event types exist", async () => {
      const allEventTypes = await repository.getAll();

      expect(allEventTypes).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should update an existing event type", async () => {
      const eventType = EventType.fromPrimitives(testEventType);
      await repository.create(eventType);

      const updatedLabel = {
        en: "Updated Event Type",
        es: "Tipo de Evento Actualizado",
        ca: "Tipus d'Esdeveniment Actualitzat",
      };
      const updatedEventType = EventType.fromPrimitives({
        ...testEventType,
        label: updatedLabel,
      });

      const result = await repository.update(updatedEventType);

      expect(result).toBeDefined();
      expect(result.toPrimitives()).toEqual({
        ...testEventType,
        label: updatedLabel,
      });

      const storedEventType = await repository.getById(
        new EventTypeId(eventType.toPrimitives().id),
      );
      expect(storedEventType.toPrimitives()).toEqual({
        ...testEventType,
        label: updatedLabel,
      });
    });
  });

  describe("delete", () => {
    it("should delete an existing event type", async () => {
      const eventType = EventType.fromPrimitives(testEventType);
      await repository.create(eventType);

      await repository.delete(new EventTypeId(testEventType.id));

      const storedEventType = await repository.getById(
        new EventTypeId(testEventType.id),
      );
      expect(storedEventType).toBeUndefined();
    });
  });
});

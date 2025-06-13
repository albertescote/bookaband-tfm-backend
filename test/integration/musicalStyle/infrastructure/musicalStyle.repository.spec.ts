import { Test, TestingModule } from "@nestjs/testing";
import { MusicalStyleRepository } from "../../../../src/context/musicalStyle/infrastructure/musicalStyle.repository";
import MongoCollectionService from "../../../../src/context/shared/infrastructure/db/mongoCollection.service";
import MongoService from "../../../../src/context/shared/infrastructure/db/mongo.service";
import { MongoClient } from "mongodb";
import { MONGO_DB_URL, MONGODB_COLLECTIONS } from "../../../../src/config";
import { MusicalStyle } from "../../../../src/context/shared/domain/musicalStyle";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";

describe("MusicalStyleRepository Integration Tests", () => {
  let repository: MusicalStyleRepository;
  let mongoCollectionService: MongoCollectionService;
  let testMusicalStyle: MusicalStyle;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        MusicalStyleRepository,
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

    repository = module.get<MusicalStyleRepository>(MusicalStyleRepository);
    mongoCollectionService = module.get<MongoCollectionService>(
      MongoCollectionService,
    );
  });

  beforeEach(async () => {
    testMusicalStyle = MusicalStyle.create(
      {
        en: "Test Style",
        es: "Estilo de Prueba",
        ca: "Estil de Prova",
      },
      "🎵",
    );

    await repository.create(testMusicalStyle);
  });

  afterEach(async () => {
    await mongoCollectionService.deleteMany(
      MONGODB_COLLECTIONS.MUSICAL_STYLES,
      {
        $or: [
          { id: testMusicalStyle.toPrimitives().id },
          { "label.en": "Test Style" },
        ],
      },
    );
  });

  afterAll(async () => {
    const mongoService = module.get<MongoService>(MongoService);
    await mongoService.onModuleDestroy();
  });

  describe("getById", () => {
    it("should retrieve musical style by id", async () => {
      const style = await repository.getById(
        new MusicalStyleId(testMusicalStyle.toPrimitives().id),
      );
      expect(style).toBeDefined();
      expect(style.toPrimitives()).toEqual(testMusicalStyle.toPrimitives());
    });

    it("should return undefined for non-existent musical style id", async () => {
      const nonExistentId = MusicalStyleId.generate();
      const style = await repository.getById(nonExistentId);
      expect(style).toBeUndefined();
    });
  });

  describe("getAll", () => {
    it("should retrieve all musical styles", async () => {
      const styles = await repository.getAll();
      expect(styles).toBeDefined();
      expect(Array.isArray(styles)).toBe(true);
      expect(styles.length).toBeGreaterThan(0);
      expect(styles[0].toPrimitives()).toEqual(testMusicalStyle.toPrimitives());
    });
  });

  describe("update", () => {
    it("should successfully update a musical style", async () => {
      const updatedStyle = MusicalStyle.fromPrimitives({
        ...testMusicalStyle.toPrimitives(),
        label: {
          en: "Updated Style",
          es: "Estilo Actualizado",
          ca: "Estil Actualitzat",
        },
        icon: "🎸",
      });

      const updated = await repository.update(updatedStyle);
      expect(updated).toBeDefined();
      expect(updated.toPrimitives()).toEqual(updatedStyle.toPrimitives());

      const retrieved = await repository.getById(
        new MusicalStyleId(updatedStyle.toPrimitives().id),
      );
      expect(retrieved.toPrimitives()).toEqual(updatedStyle.toPrimitives());
    });
  });

  describe("delete", () => {
    it("should successfully delete a musical style", async () => {
      await repository.delete(
        new MusicalStyleId(testMusicalStyle.toPrimitives().id),
      );

      const deleted = await repository.getById(
        new MusicalStyleId(testMusicalStyle.toPrimitives().id),
      );
      expect(deleted).toBeUndefined();
    });
  });
});

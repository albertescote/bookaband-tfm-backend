import { Test, TestingModule } from "@nestjs/testing";
import { MusicalStyleService } from "../../../../src/context/musicalStyle/service/musicalStyle.service";
import { MusicalStyleRepository } from "../../../../src/context/musicalStyle/infrastructure/musicalStyle.repository";
import { MusicalStyle } from "../../../../src/context/shared/domain/musicalStyle";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";

describe("MusicalStyleService", () => {
  let service: MusicalStyleService;
  let repository: jest.Mocked<MusicalStyleRepository>;

  const mockMusicalStyle = {
    id: MusicalStyleId.generate().toPrimitive(),
    label: {
      en: "Rock",
      es: "Rock",
    },
    icon: "rock-icon",
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MusicalStyleService,
        {
          provide: MusicalStyleRepository,
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<MusicalStyleService>(MusicalStyleService);
  });

  describe("create", () => {
    it("should create a new musical style", async () => {
      const createRequest = {
        label: {
          en: "Rock",
          es: "Rock",
        },
        icon: "rock-icon",
      };

      const musicalStyle = MusicalStyle.create(
        createRequest.label,
        createRequest.icon,
      );

      repository.create.mockResolvedValue(musicalStyle);

      const result = await service.create(createRequest);

      expect(result).toEqual(musicalStyle.toPrimitives());
      expect(repository.create).toHaveBeenCalledWith({
        ...musicalStyle,
        id: expect.any(MusicalStyleId),
      });
    });
  });

  describe("getById", () => {
    it("should return a musical style by id", async () => {
      const musicalStyle = MusicalStyle.fromPrimitives(mockMusicalStyle);
      repository.getById.mockResolvedValue(musicalStyle);

      const result = await service.getById(mockMusicalStyle.id);

      expect(result).toEqual(mockMusicalStyle);
      expect(repository.getById).toHaveBeenCalledWith(
        new MusicalStyleId(mockMusicalStyle.id),
      );
    });
  });

  describe("getAll", () => {
    it("should return all musical styles", async () => {
      const musicalStyles = [
        MusicalStyle.fromPrimitives(mockMusicalStyle),
        MusicalStyle.fromPrimitives({
          ...mockMusicalStyle,
          id: MusicalStyleId.generate().toPrimitive(),
          label: {
            en: "Jazz",
            es: "Jazz",
          },
          icon: "jazz-icon",
        }),
      ];

      repository.getAll.mockResolvedValue(musicalStyles);

      const result = await service.getAll();

      expect(result).toEqual(
        musicalStyles.map((style) => style.toPrimitives()),
      );
      expect(repository.getAll).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a musical style", async () => {
      const updateRequest = {
        id: mockMusicalStyle.id,
        label: {
          en: "Rock & Roll",
          es: "Rock & Roll",
        },
        icon: "rock-roll-icon",
      };

      const musicalStyle = MusicalStyle.fromPrimitives(updateRequest);
      repository.update.mockResolvedValue(musicalStyle);

      const result = await service.update(updateRequest);

      expect(result).toEqual(updateRequest);
      expect(repository.update).toHaveBeenCalledWith(musicalStyle);
    });
  });

  describe("delete", () => {
    it("should delete a musical style", async () => {
      await service.delete(mockMusicalStyle.id);

      expect(repository.delete).toHaveBeenCalledWith(
        new MusicalStyleId(mockMusicalStyle.id),
      );
    });
  });
});

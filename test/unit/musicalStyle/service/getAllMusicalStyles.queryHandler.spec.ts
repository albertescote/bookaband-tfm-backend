import { Test, TestingModule } from "@nestjs/testing";
import { GetAllMusicalStylesQueryHandler } from "../../../../src/context/musicalStyle/service/getAllMusicalStyles.queryHandler";
import { GetAllMusicalStylesQuery } from "../../../../src/context/musicalStyle/service/getAllMusicalStyles.query";
import { MusicalStyleRepository } from "../../../../src/context/musicalStyle/infrastructure/musicalStyle.repository";
import { MusicalStyle } from "../../../../src/context/shared/domain/musicalStyle";
import MusicalStyleId from "../../../../src/context/musicalStyle/domain/musicalStyleId";

describe("GetAllMusicalStylesQueryHandler", () => {
  let handler: GetAllMusicalStylesQueryHandler;
  let repository: jest.Mocked<MusicalStyleRepository>;

  const mockMusicalStyles = [
    {
      id: MusicalStyleId.generate().toPrimitive(),
      label: {
        en: "Rock",
        es: "Rock",
      },
      icon: "rock-icon",
    },
    {
      id: MusicalStyleId.generate().toPrimitive(),
      label: {
        en: "Jazz",
        es: "Jazz",
      },
      icon: "jazz-icon",
    },
  ];

  beforeEach(async () => {
    repository = {
      getAll: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllMusicalStylesQueryHandler,
        {
          provide: MusicalStyleRepository,
          useValue: repository,
        },
      ],
    }).compile();

    handler = module.get<GetAllMusicalStylesQueryHandler>(
      GetAllMusicalStylesQueryHandler,
    );
  });

  describe("execute", () => {
    it("should return all musical styles", async () => {
      const musicalStyles = mockMusicalStyles.map((style) =>
        MusicalStyle.fromPrimitives(style),
      );

      repository.getAll.mockResolvedValue(musicalStyles);

      const query = new GetAllMusicalStylesQuery();
      const result = await handler.execute(query);

      expect(result).toEqual(mockMusicalStyles);
      expect(repository.getAll).toHaveBeenCalled();
    });

    it("should return empty array when no musical styles are found", async () => {
      repository.getAll.mockResolvedValue([]);

      const query = new GetAllMusicalStylesQuery();
      const result = await handler.execute(query);

      expect(result).toStrictEqual([]);
      expect(repository.getAll).toHaveBeenCalled();
    });
  });
});

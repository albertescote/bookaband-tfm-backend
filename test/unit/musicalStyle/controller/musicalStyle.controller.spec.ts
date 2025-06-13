import { Test, TestingModule } from "@nestjs/testing";
import { MusicalStyleController } from "../../../../src/app/api/musicalStyle/musicalStyle.controller";
import { MusicalStyleService } from "../../../../src/context/musicalStyle/service/musicalStyle.service";
import { CreateMusicalStyleRequestDto } from "../../../../src/app/api/musicalStyle/createMusicalStyle.dto";
import { UpdateMusicalStyleRequestDto } from "../../../../src/app/api/musicalStyle/updateMusicalStyle.dto";

interface MusicalStyleResponseDto {
  id: string;
  label: Record<string, string>;
  icon: string;
}

describe("MusicalStyleController", () => {
  let controller: MusicalStyleController;

  const mockMusicalStyleService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicalStyleController],
      providers: [
        {
          provide: MusicalStyleService,
          useValue: mockMusicalStyleService,
        },
      ],
    }).compile();

    controller = module.get<MusicalStyleController>(MusicalStyleController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new musical style", async () => {
      const createMusicalStyleDto: CreateMusicalStyleRequestDto = {
        label: {
          en: "Rock",
          es: "Rock",
        },
        icon: "rock-icon",
      };

      const expectedResponse: MusicalStyleResponseDto = {
        id: "1",
        label: {
          en: "Rock",
          es: "Rock",
        },
        icon: "rock-icon",
      };

      mockMusicalStyleService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createMusicalStyleDto);

      expect(result).toEqual(expectedResponse);
      expect(mockMusicalStyleService.create).toHaveBeenCalledWith(
        createMusicalStyleDto,
      );
    });
  });

  describe("getAll", () => {
    it("should return all musical styles", async () => {
      const expectedResponse: MusicalStyleResponseDto[] = [
        {
          id: "1",
          label: {
            en: "Rock",
            es: "Rock",
          },
          icon: "rock-icon",
        },
        {
          id: "2",
          label: {
            en: "Jazz",
            es: "Jazz",
          },
          icon: "jazz-icon",
        },
      ];

      mockMusicalStyleService.getAll.mockResolvedValue(expectedResponse);

      const result = await controller.getAll();

      expect(result).toEqual(expectedResponse);
      expect(mockMusicalStyleService.getAll).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should return a musical style by id", async () => {
      const musicalStyleId = "1";

      const expectedResponse: MusicalStyleResponseDto = {
        id: "1",
        label: {
          en: "Rock",
          es: "Rock",
        },
        icon: "rock-icon",
      };

      mockMusicalStyleService.getById.mockResolvedValue(expectedResponse);

      const result = await controller.getById(musicalStyleId);

      expect(result).toEqual(expectedResponse);
      expect(mockMusicalStyleService.getById).toHaveBeenCalledWith(
        musicalStyleId,
      );
    });
  });

  describe("update", () => {
    it("should update a musical style", async () => {
      const musicalStyleId = "1";

      const updateMusicalStyleDto: UpdateMusicalStyleRequestDto = {
        id: "1",
        label: {
          en: "Rock & Roll",
          es: "Rock & Roll",
        },
        icon: "rock-roll-icon",
      };

      const expectedResponse: MusicalStyleResponseDto = {
        id: "1",
        label: {
          en: "Rock & Roll",
          es: "Rock & Roll",
        },
        icon: "rock-roll-icon",
      };

      mockMusicalStyleService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(
        musicalStyleId,
        updateMusicalStyleDto,
      );

      expect(result).toEqual(expectedResponse);
      expect(mockMusicalStyleService.update).toHaveBeenCalledWith({
        ...updateMusicalStyleDto,
        id: musicalStyleId,
      });
    });
  });

  describe("delete", () => {
    it("should delete a musical style", async () => {
      const musicalStyleId = "1";

      mockMusicalStyleService.delete.mockResolvedValue(undefined);

      await controller.delete(musicalStyleId);

      expect(mockMusicalStyleService.delete).toHaveBeenCalledWith(
        musicalStyleId,
      );
    });
  });
});

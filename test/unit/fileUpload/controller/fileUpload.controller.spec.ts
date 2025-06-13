import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";
import { FileUploadController } from "../../../../src/app/api/fileUpload/fileUpload.controller";
import { FileUploadService } from "../../../../src/context/fileUpload/service/fileUpload.service";
import { NoFileUploadedException } from "../../../../src/context/fileUpload/exceptions/noFileUploadedException";

describe("FileUploadController", () => {
  let controller: FileUploadController;

  const mockFileUploadService = {
    getFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("uploadFile", () => {
    it("should successfully upload a valid file", async () => {
      const mockFile = {
        filename: "test-123456789.jpg",
        originalname: "test.jpg",
        mimetype: "image/jpeg",
        size: 1024,
      } as Express.Multer.File;

      const result = await controller.uploadFile(mockFile);

      expect(result).toEqual({
        filename: mockFile.filename,
        originalname: mockFile.originalname,
        mimetype: mockFile.mimetype,
        size: mockFile.size,
        url: expect.stringContaining(`/files/${mockFile.filename}`),
      });
    });

    it("should throw NoFileUploadedException when no file is provided", async () => {
      await expect(controller.uploadFile(null)).rejects.toThrow(
        NoFileUploadedException,
      );
    });
  });

  describe("getFile", () => {
    it("should get a file by filename", async () => {
      const filename = "test-123456789.jpg";
      const mockResponse = {
        sendFile: jest.fn(),
      } as unknown as Response;

      await controller.getFile(filename, mockResponse);

      expect(mockFileUploadService.getFile).toHaveBeenCalledWith(
        filename,
        mockResponse,
      );
    });
  });
});

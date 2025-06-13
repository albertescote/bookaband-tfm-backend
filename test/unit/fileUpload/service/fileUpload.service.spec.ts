import { Test, TestingModule } from "@nestjs/testing";
import { FileUploadService } from "../../../../src/context/fileUpload/service/fileUpload.service";
import { Response } from "express";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { FileNotFoundException } from "../../../../src/context/fileUpload/exceptions/fileNotFoundException";
import { ErrorReadingFileException } from "../../../../src/context/fileUpload/exceptions/errorReadingFileException";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  createReadStream: jest.fn(),
}));

jest.mock("path", () => ({
  join: jest.fn(),
}));

describe("FileUploadService", () => {
  let service: FileUploadService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadService],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);

    mockResponse = {
      setHeader: jest.fn(),
      pipe: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getFile", () => {
    const mockFilename = "test-file.pdf";
    const mockFilePath = "/path/to/uploads/test-file.pdf";
    const mockStream = {
      on: jest.fn(),
      pipe: jest.fn(),
    };

    beforeEach(() => {
      (join as jest.Mock).mockReturnValue(mockFilePath);
      (createReadStream as jest.Mock).mockReturnValue(mockStream);
    });

    it("should successfully stream a file", async () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      await service.getFile(mockFilename, mockResponse as Response);

      expect(join).toHaveBeenCalledWith(process.cwd(), "uploads", mockFilename);
      expect(existsSync).toHaveBeenCalledWith(mockFilePath);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        `attachment; filename="${mockFilename}"`,
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf",
      );
      expect(createReadStream).toHaveBeenCalledWith(mockFilePath);
      expect(mockStream.on).toHaveBeenCalledWith("error", expect.any(Function));
      expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    });

    it("should throw FileNotFoundException when file does not exist", async () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      await expect(
        service.getFile(mockFilename, mockResponse as Response),
      ).rejects.toThrow(FileNotFoundException);

      expect(join).toHaveBeenCalledWith(process.cwd(), "uploads", mockFilename);
      expect(existsSync).toHaveBeenCalledWith(mockFilePath);
      expect(createReadStream).not.toHaveBeenCalled();
    });

    it("should throw ErrorReadingFileException when there is an error reading the file", async () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      (mockStream.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === "error") {
          callback();
        }
        return mockStream;
      });

      await expect(
        service.getFile(mockFilename, mockResponse as Response),
      ).rejects.toThrow(ErrorReadingFileException);

      expect(createReadStream).toHaveBeenCalledWith(mockFilePath);
    });
  });
});

import { Test, TestingModule } from "@nestjs/testing";
import { StoreFileCommandHandler } from "../../../../src/context/fileUpload/service/storeFile.commandHandler";
import { StoreFileCommand } from "../../../../src/context/fileUpload/service/storeFile.command";
import { join } from "path";
import { existsSync, writeFileSync } from "fs";

jest.mock("fs", () => ({
  existsSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock("path", () => ({
  join: jest.fn(),
}));

describe("StoreFileCommandHandler", () => {
  let handler: StoreFileCommandHandler;
  const mockUploadsDir = "/path/to/uploads";
  const mockFilePath = "/path/to/uploads/test-file.pdf";
  const mockFileContent = Buffer.from("test content");

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreFileCommandHandler],
    }).compile();

    handler = module.get<StoreFileCommandHandler>(StoreFileCommandHandler);

    (join as jest.Mock).mockImplementation((...args) => {
      if (
        args.length === 2 &&
        args[0] === process.cwd() &&
        args[1] === "uploads"
      ) {
        return mockUploadsDir;
      }
      return mockFilePath;
    });

    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should successfully store a file", async () => {
      (existsSync as jest.Mock).mockReturnValue(true);
      const command = new StoreFileCommand("test-file.pdf", mockFileContent);

      await handler.execute(command);

      expect(join).toHaveBeenCalledWith(process.cwd(), "uploads");
      expect(existsSync).toHaveBeenCalledWith(mockUploadsDir);
      expect(join).toHaveBeenCalledWith(mockUploadsDir, "test-file.pdf");
      expect(writeFileSync).toHaveBeenCalledWith(mockFilePath, mockFileContent);
    });

    it("should throw an error when uploads directory does not exist", async () => {
      (existsSync as jest.Mock).mockReturnValue(false);
      const command = new StoreFileCommand("test-file.pdf", mockFileContent);

      await expect(handler.execute(command)).rejects.toThrow(
        "Uploads directory does not exist",
      );

      expect(join).toHaveBeenCalledWith(process.cwd(), "uploads");
      expect(existsSync).toHaveBeenCalledWith(mockUploadsDir);
      expect(writeFileSync).not.toHaveBeenCalled();
    });
  });
});

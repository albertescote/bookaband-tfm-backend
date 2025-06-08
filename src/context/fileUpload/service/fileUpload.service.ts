import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { createReadStream, existsSync, writeFileSync } from "fs";
import { join } from "path";
import { FileNotFoundException } from "../exceptions/fileNotFoundException";
import { ErrorReadingFileException } from "../exceptions/errorReadingFileException";
import { EXTERNAL_URL } from "../../../config";

@Injectable()
export class FileUploadService {
  async getFile(filename: string, res: Response) {
    const filePath = join(process.cwd(), "uploads", filename);

    if (!existsSync(filePath)) {
      throw new FileNotFoundException();
    }

    const stream = createReadStream(filePath);

    stream.on("error", () => {
      throw new ErrorReadingFileException();
    });

    stream.pipe(res);
  }

  async storeFile(fileName: string, fileContent: Buffer): Promise<string> {
    const uploadsDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      throw new Error("Uploads directory does not exist");
    }

    const filePath = join(uploadsDir, fileName);
    writeFileSync(filePath, fileContent);

    return `${EXTERNAL_URL}/files/${fileName}`;
  }
}

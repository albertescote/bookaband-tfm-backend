import { Injectable } from "@nestjs/common";
import { Response } from "express";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { FileNotFoundException } from "../exceptions/fileNotFoundException";
import { ErrorReadingFileException } from "../exceptions/errorReadingFileException";

@Injectable()
export class FileUploadService {
  async getFile(filename: string, res: Response) {
    const filePath = join(process.cwd(), "uploads", filename);

    if (!existsSync(filePath)) {
      throw new FileNotFoundException();
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    const stream = createReadStream(filePath);

    stream.on("error", () => {
      throw new ErrorReadingFileException();
    });

    stream.pipe(res);
  }
}

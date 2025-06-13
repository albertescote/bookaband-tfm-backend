import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FileUploadService } from "../../../context/fileUpload/service/fileUpload.service";
import { EXTERNAL_URL } from "../../../config";
import { JwtCustomGuard } from "../../../context/auth/guards/jwt-custom.guard";
import { diskStorage } from "multer";
import { extname } from "path";
import { existsSync, mkdirSync } from "fs";
import { InvalidFileExtensionException } from "../../../context/fileUpload/exceptions/invalidFileExtensionException";
import { InvalidFileTypeException } from "../../../context/fileUpload/exceptions/invalidFileTypeException";
import { NoFileUploadedException } from "../../../context/fileUpload/exceptions/noFileUploadedException";

const uploadsDir = "./uploads";
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".doc",
  ".docx",
  ".mp3",
  ".wav",
  ".ogg",
  ".mp4",
  ".webm",
  ".mov",
];

// Maximum file size (25MB)
const MAX_FILE_SIZE = 25 * 1024 * 1024;

@Controller("files")
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post("upload")
  @UseGuards(JwtCustomGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext)) {
          return callback(
            new InvalidFileExtensionException(ext, allowedExtensions),
            false,
          );
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new InvalidFileTypeException(file.mimetype, allowedMimeTypes),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new NoFileUploadedException();
    }
    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `${EXTERNAL_URL}/files/${file.filename}`,
    };
  }

  @Get(":filename")
  async getFile(@Param("filename") filename: string, @Res() res: Response) {
    return this.fileUploadService.getFile(filename, res);
  }
}

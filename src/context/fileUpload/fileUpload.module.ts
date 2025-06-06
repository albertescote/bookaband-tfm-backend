import { Module } from "@nestjs/common";
import { FileUploadController } from "../../app/api/fileUpload/fileUpload.controller";
import { FileUploadService } from "./service/fileUpload.service";

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}

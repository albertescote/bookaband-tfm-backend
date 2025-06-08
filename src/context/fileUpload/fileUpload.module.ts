import { Module } from "@nestjs/common";
import { FileUploadController } from "../../app/api/fileUpload/fileUpload.controller";
import { FileUploadService } from "./service/fileUpload.service";
import { StoreFileCommandHandler } from "./service/storeFile.commandHandler";

@Module({
  controllers: [FileUploadController],
  providers: [FileUploadService, StoreFileCommandHandler],
  exports: [FileUploadService, StoreFileCommandHandler],
})
export class FileUploadModule {}

import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { StoreFileCommand } from "./storeFile.command";
import { join } from "path";
import { existsSync, writeFileSync } from "fs";

@Injectable()
@CommandHandler(StoreFileCommand)
export class StoreFileCommandHandler
  implements ICommandHandler<StoreFileCommand>
{
  constructor() {}

  async execute(command: StoreFileCommand): Promise<void> {
    const { fileName, fileContent } = command;
    const uploadsDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadsDir)) {
      throw new Error("Uploads directory does not exist");
    }

    const filePath = join(uploadsDir, fileName);
    writeFileSync(filePath, fileContent);
  }
}

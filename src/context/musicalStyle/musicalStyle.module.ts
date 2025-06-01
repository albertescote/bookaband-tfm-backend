import { Module } from "@nestjs/common";
import { MusicalStyleController } from "../../app/api/musicalStyle/musicalStyle.controller";
import { MusicalStyleService } from "./service/musicalStyle.service";
import { MusicalStyleRepository } from "./infrastructure/musicalStyle.repository";
import MongoCollectionService from "../shared/infrastructure/db/mongoCollection.service";
import { GetAllMusicalStylesQueryHandler } from "./service/getAllMusicalStyles.queryHandler";

@Module({
  controllers: [MusicalStyleController],
  providers: [
    MusicalStyleService,
    MusicalStyleRepository,
    MongoCollectionService,
    GetAllMusicalStylesQueryHandler,
  ],
  exports: [MusicalStyleService, GetAllMusicalStylesQueryHandler],
})
export class MusicalStyleModule {} 
import { Module } from "@nestjs/common";
import { MusicalStyleController } from "../../app/api/musicalStyle/musicalStyle.controller";
import { MusicalStyleService } from "./service/musicalStyle.service";
import { MusicalStyleRepository } from "./infrastructure/musicalStyle.repository";
import MongoCollectionService from "../shared/infrastructure/db/mongoCollection.service";
import { GetAllMusicalStylesQueryHandler } from "./service/getAllMusicalStyles.queryHandler";
import MongoService from "../shared/infrastructure/db/mongo.service";
import { MongoClient } from "mongodb";
import { MONGO_DB_URL } from "../../config";

const mongoClient = {
  provide: MongoClient,
  useFactory: async () => {
    return new MongoClient(MONGO_DB_URL);
  },
};

@Module({
  controllers: [MusicalStyleController],
  providers: [
    mongoClient,
    MongoService,
    MongoCollectionService,
    MusicalStyleService,
    MusicalStyleRepository,
    GetAllMusicalStylesQueryHandler,
  ],
  exports: [MusicalStyleService, GetAllMusicalStylesQueryHandler],
})
export class MusicalStyleModule {}

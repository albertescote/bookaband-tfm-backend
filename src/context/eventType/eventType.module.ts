import { Module } from "@nestjs/common";
import { EventTypeService } from "./service/eventType.service";
import { EventTypeRepository } from "./infrastructure/eventType.repository";
import { GetAllEventTypesQueryHandler } from "./service/getAllEventTypes.queryHandler";
import MongoCollectionService from "../shared/infrastructure/db/mongoCollection.service";
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
  providers: [
    mongoClient,
    MongoService,
    MongoCollectionService,
    EventTypeRepository,
    EventTypeService,
    GetAllEventTypesQueryHandler,
  ],
  exports: [EventTypeService, GetAllEventTypesQueryHandler],
})
export class EventTypeModule {}

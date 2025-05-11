import { Module } from "@nestjs/common";
import PrismaService from "../shared/infrastructure/db/prisma.service";
import { EventTypeService } from "./service/eventType.service";
import { EventTypeRepository } from "./infrastructure/eventType.repository";
import { GetAllEventTypesQueryHandler } from "./service/getAllEventTypes.queryHandler";

@Module({
  providers: [
    PrismaService,
    EventTypeRepository,
    EventTypeService,
    GetAllEventTypesQueryHandler,
  ],
  exports: [EventTypeService, GetAllEventTypesQueryHandler],
})
export class EventTypeModule {}

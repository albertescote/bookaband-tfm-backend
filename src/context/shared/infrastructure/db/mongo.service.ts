import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Db, MongoClient } from "mongodb";
import { MONGO_DB_NAME } from "../../../../config";

@Injectable()
export default class MongoService implements OnModuleInit, OnModuleDestroy {
  constructor(private client: MongoClient) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  getDatabase(): Db {
    return this.client.db(MONGO_DB_NAME);
  }
}

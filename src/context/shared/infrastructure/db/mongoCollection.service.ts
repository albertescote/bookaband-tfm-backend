import { Injectable } from "@nestjs/common";
import {
  Collection,
  Db,
  Document,
  Filter,
  FindOptions,
  InsertOneOptions,
  OptionalId,
  UpdateFilter,
  UpdateOptions,
  WithId,
} from "mongodb";
import MongoService from "./mongo.service";
import { MONGODB_COLLECTIONS } from "../../../../config";

@Injectable()
export default class MongoCollectionService {
  private database: Db;
  constructor(mongoService: MongoService) {
    this.database = mongoService.getDatabase();
  }

  findOne(
    collection: MONGODB_COLLECTIONS,
    filter: Filter<Document>,
    options?: FindOptions<Document>,
  ) {
    return this.getCollection(collection).findOne(filter, options);
  }

  async findMany(
    collection: MONGODB_COLLECTIONS,
    filter?: Filter<Document>,
    options?: FindOptions<Document>,
  ): Promise<WithId<Document>[]> {
    return this.getCollection(collection).find(filter, options).toArray();
  }

  async updateOne(
    collection: MONGODB_COLLECTIONS,
    filter: Filter<Document>,
    update: Partial<Document> | UpdateFilter<Document>,
    options?: UpdateOptions,
  ) {
    await this.getCollection(collection).updateOne(filter, update, options);
  }

  async insertOne(
    collection: MONGODB_COLLECTIONS,
    doc: OptionalId<Document>,
    options?: InsertOneOptions,
  ) {
    await this.getCollection(collection).insertOne(doc, options);
  }

  async deleteOne(collection: MONGODB_COLLECTIONS, filter: Filter<Document>) {
    await this.getCollection(collection).deleteMany(filter);
  }

  async deleteMany(collection: MONGODB_COLLECTIONS, filter: Filter<Document>) {
    await this.getCollection(collection).deleteOne(filter);
  }

  async countDocuments(
    collection: MONGODB_COLLECTIONS,
    filter: Filter<Document>,
  ): Promise<number> {
    return this.getCollection(collection).countDocuments(filter);
  }

  private getCollection(collection: MONGODB_COLLECTIONS): Collection {
    return this.database.collection(collection);
  }
}

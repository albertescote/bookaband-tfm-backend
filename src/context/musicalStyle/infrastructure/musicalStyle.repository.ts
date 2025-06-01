import { MusicalStyle } from "../../shared/domain/musicalStyle";
import MusicalStyleId from "../domain/musicalStyleId";
import MongoCollectionService from "../../shared/infrastructure/db/mongoCollection.service";
import { MONGODB_COLLECTIONS } from "../../../config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MusicalStyleRepository {
  constructor(
    private readonly mongoCollectionService: MongoCollectionService,
  ) {}

  async create(style: MusicalStyle): Promise<MusicalStyle> {
    const primitives = style.toPrimitives();

    await this.mongoCollectionService.insertOne(
      MONGODB_COLLECTIONS.MUSICAL_STYLES,
      {
        id: primitives.id,
        label: primitives.label,
        icon: primitives.icon,
      },
    );

    return style;
  }

  async getById(id: MusicalStyleId): Promise<MusicalStyle | undefined> {
    const query = { id: id.toPrimitive() };

    const result = await this.mongoCollectionService.findOne(
      MONGODB_COLLECTIONS.MUSICAL_STYLES,
      query,
    );

    if (!result) return undefined;

    return MusicalStyle.fromPrimitives({
      id: result.id,
      label: result.label,
      icon: result.icon,
    });
  }

  async getAll(): Promise<MusicalStyle[]> {
    const result = await this.mongoCollectionService.findMany(
      MONGODB_COLLECTIONS.MUSICAL_STYLES,
      {},
    );

    return result.map((doc) =>
      MusicalStyle.fromPrimitives({
        id: doc.id,
        label: doc.label,
        icon: doc.icon,
      }),
    );
  }

  async update(style: MusicalStyle): Promise<MusicalStyle> {
    const primitives = style.toPrimitives();

    await this.mongoCollectionService.updateOne(
      MONGODB_COLLECTIONS.MUSICAL_STYLES,
      { id: primitives.id },
      {
        $set: {
          label: primitives.label,
          icon: primitives.icon,
        },
      },
    );

    return style;
  }

  async delete(id: MusicalStyleId): Promise<void> {
    await this.mongoCollectionService.deleteOne(
      MONGODB_COLLECTIONS.MUSICAL_STYLES,
      { id: id.toPrimitive() },
    );
  }
} 
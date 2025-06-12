import NotificationId from "../domain/notificationId";
import MongoCollectionService from "../../shared/infrastructure/db/mongoCollection.service";
import { MONGODB_COLLECTIONS } from "../../../config";
import { Injectable } from "@nestjs/common";
import { Notification } from "../domain/notificaiton";
import UserId from "../../shared/domain/userId";
import BandId from "../../shared/domain/bandId";

@Injectable()
export class NotificationRepository {
  constructor(
    private readonly mongoCollectionService: MongoCollectionService,
  ) {}

  async create(notification: Notification): Promise<Notification> {
    const primitives = notification.toPrimitives();

    await this.mongoCollectionService.insertOne(
      MONGODB_COLLECTIONS.NOTIFICATIONS,
      {
        id: primitives.id,
        bandId: primitives.bandId,
        userId: primitives.userId,
        isReadFromBand: primitives.isReadFromBand,
        isReadFromUser: primitives.isReadFromBand,
        createdAt: primitives.createdAt,
        invitationMetadata: primitives.invitationMetadata,
        bookingMetadata: primitives.bookingMetadata,
      },
    );

    return notification;
  }

  async getById(id: NotificationId): Promise<Notification | undefined> {
    const query = { id: id.toPrimitive() };

    const result = await this.mongoCollectionService.findOne(
      MONGODB_COLLECTIONS.NOTIFICATIONS,
      query,
    );

    if (!result) return undefined;

    return Notification.fromPrimitives({
      id: result.id,
      bandId: result.bandId,
      userId: result.userId,
      isReadFromBand: result.isReadFromBand,
      isReadFromUser: result.isReadFromUser,
      createdAt: result.createdAt,
      invitationMetadata: result.invitationMetadata,
      bookingMetadata: result.bookingMetadata,
    });
  }

  async getAll(): Promise<Notification[]> {
    const result = await this.mongoCollectionService.findMany(
      MONGODB_COLLECTIONS.NOTIFICATIONS,
      {},
    );

    return result.map((doc) =>
      Notification.fromPrimitives({
        id: doc.id,
        bandId: doc.bandId,
        userId: doc.userId,
        isReadFromBand: doc.isReadFromBand,
        isReadFromUser: doc.isReadFromUser,
        createdAt: doc.createdAt,
        invitationMetadata: doc.invitationMetadata,
        bookingMetadata: doc.bookingMetadata,
      }),
    );
  }

  async getAllFromUser(userId: UserId): Promise<Notification[]> {
    const result = await this.mongoCollectionService.findMany(
      MONGODB_COLLECTIONS.NOTIFICATIONS,
      { userId: userId.toPrimitive() },
    );

    if (!result) {
      return [];
    }

    return result.map((doc) =>
      Notification.fromPrimitives({
        id: doc.id,
        bandId: doc.bandId,
        userId: doc.userId,
        isReadFromBand: doc.isReadFromBand,
        isReadFromUser: doc.isReadFromUser,
        createdAt: doc.createdAt,
        invitationMetadata: doc.invitationMetadata,
        bookingMetadata: doc.bookingMetadata,
      }),
    );
  }

  async getAllFromBandId(bandId: BandId): Promise<Notification[]> {
    const result = await this.mongoCollectionService.findMany(
      MONGODB_COLLECTIONS.NOTIFICATIONS,
      { bandId: bandId.toPrimitive() },
    );

    if (!result) {
      return [];
    }

    return result.map((doc) =>
      Notification.fromPrimitives({
        id: doc.id,
        bandId: doc.bandId,
        userId: doc.userId,
        isReadFromBand: doc.isReadFromBand,
        isReadFromUser: doc.isReadFromUser,
        createdAt: doc.createdAt,
        invitationMetadata: doc.invitationMetadata,
        bookingMetadata: doc.bookingMetadata,
      }),
    );
  }

  async update(notification: Notification): Promise<Notification> {
    const primitives = notification.toPrimitives();

    await this.mongoCollectionService.updateOne(
      MONGODB_COLLECTIONS.NOTIFICATIONS,
      { id: primitives.id },
      {
        $set: primitives,
      },
    );

    return notification;
  }

  async delete(id: NotificationId): Promise<void> {
    await this.mongoCollectionService.deleteOne(
      MONGODB_COLLECTIONS.NOTIFICATIONS,
      { id: id.toPrimitive() },
    );
  }
}

import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { UserQuery } from "../../user/service/user.query";
import User from "../domain/user";
import { GetBandMembersQuery } from "../../band/service/getBandMembers.query";
import { BandPrimitives } from "../../band/domain/band";
import { GetBandInfoQuery } from "../../band/service/getBandInfo.query";
import { JoinBandCommand } from "../../band/service/joinBand.command";
import { SendVerificationEmailCommand } from "../../email/service/sendVerificationEmail.command";
import { Languages } from "../domain/languages";
import { SendResetPasswordEmailCommand } from "../../email/service/sendResetPasswordEmail.command";
import { GetResetPasswordSessionQuery } from "../../email/service/getResetPasswordSession.query";
import { ResetPasswordSessionPrimitives } from "../../email/domain/resetPasswordSession";
import UserId from "../domain/userId";
import { CreateUserFromGoogleCommand } from "../../user/service/createUserFromGoogle.command";
import { Role } from "../domain/role";
import { GetAllEventTypesQuery } from "../../eventType/service/getAllEventTypes.query";
import { EventTypePrimitives } from "../domain/eventType";
import { GetUserIdByBookingIdQuery } from "../../booking/service/getUserIdByBookingId.query";
import { CreateVerificationRecordCommand } from "../../email/service/createVerificationRecord.command";
import { GetAllMusicalStylesQuery } from "../../musicalStyle/service/getAllMusicalStyles.query";
import { MusicalStylePrimitives } from "../domain/musicalStyle";
import { AddBookingIntoChatCommand } from "../../chat/service/addBookingIntoChat.command";
import { GetBookingByIdQuery } from "../../booking/service/getBookingById.query";
import { GenerateContractCommand } from "../../contract/service/generateContract.command";

@Injectable()
class ModuleConnectors {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async obtainUserInformation(id?: string, email?: string): Promise<User> {
    const userQuery = new UserQuery(id, email);
    return await this.queryBus.execute(userQuery);
  }

  async obtainUserIdByBookingId(id: string): Promise<string> {
    const userQuery = new GetUserIdByBookingIdQuery(id);
    return await this.queryBus.execute(userQuery);
  }

  async obtainBookingIdByContractId(id: string): Promise<string> {
    const userQuery = new GetUserIdByBookingIdQuery(id);
    return await this.queryBus.execute(userQuery);
  }

  async getAllEventTypes(): Promise<EventTypePrimitives[]> {
    const userQuery = new GetAllEventTypesQuery();
    return await this.queryBus.execute(userQuery);
  }

  async getBookingById(bookingId: string): Promise<any> {
    const query = new GetBookingByIdQuery(bookingId);
    return await this.queryBus.execute(query);
  }

  async getBandById(bandId: string): Promise<any> {
    const query = new GetBandInfoQuery(bandId);
    return await this.queryBus.execute(query);
  }

  async getAllMusicalStyles(): Promise<MusicalStylePrimitives[]> {
    const query = new GetAllMusicalStylesQuery();
    return await this.queryBus.execute(query);
  }

  async obtainBandMembers(id: string): Promise<string[]> {
    const getBandMembersQuery = new GetBandMembersQuery(id);
    return await this.queryBus.execute(getBandMembersQuery);
  }

  async obtainBandInformation(id: string): Promise<BandPrimitives> {
    const getBandInfoQuery = new GetBandInfoQuery(id);
    return await this.queryBus.execute(getBandInfoQuery);
  }

  async joinBand(bandId: string, userId: string): Promise<void> {
    const joinBandCommand = new JoinBandCommand(bandId, userId);
    await this.commandBus.execute(joinBandCommand);
  }

  async addBookingToChat(
    bandId: string,
    userId: string,
    bookingId: string,
  ): Promise<void> {
    const addBookingIntoChatCommand = new AddBookingIntoChatCommand(
      userId,
      bandId,
      bookingId,
    );
    await this.commandBus.execute(addBookingIntoChatCommand);
  }

  async createVerificationRecord(
    email: string,
    userId: string,
    lng: Languages,
    verified: boolean,
  ): Promise<void> {
    const joinBandCommand = new CreateVerificationRecordCommand(
      email,
      userId,
      lng,
      verified,
    );
    await this.commandBus.execute(joinBandCommand);
  }

  async sendVerificationEmail(
    userId: string,
    email: string,
    lng: Languages,
  ): Promise<void> {
    const sendVerificationEmailCommand = new SendVerificationEmailCommand(
      email,
      userId,
      lng,
    );
    await this.commandBus.execute(sendVerificationEmailCommand);
  }

  async sendResetPasswordEmail(
    userId: string,
    email: string,
    lng: Languages,
  ): Promise<void> {
    const sendResetPasswordEmailCommand = new SendResetPasswordEmailCommand(
      userId,
      email,
      lng,
    );
    await this.commandBus.execute(sendResetPasswordEmailCommand);
  }

  async getResetPasswordSession(
    id: string,
  ): Promise<ResetPasswordSessionPrimitives> {
    const getResetPasswordSessionQuery = new GetResetPasswordSessionQuery(id);
    return await this.queryBus.execute(getResetPasswordSessionQuery);
  }

  async createUserFromGoogle(
    firstName: string,
    familyName: string,
    email: string,
    role: Role,
    imageUrl: string,
  ): Promise<User> {
    const userId = UserId.generate();
    const createUserFromGoogleCommand = new CreateUserFromGoogleCommand(
      userId.toPrimitive(),
      firstName,
      familyName,
      email,
      role,
      imageUrl,
    );
    await this.commandBus.execute(createUserFromGoogleCommand);
    const userQuery = new UserQuery(userId.toPrimitive());
    return await this.queryBus.execute(userQuery);
  }

  async generateContract(
    bookingId: string,
    bandId: string,
    userId: string,
  ): Promise<void> {
    const generateContractCommand = new GenerateContractCommand(
      bookingId,
      bandId,
      userId,
    );
    await this.commandBus.execute(generateContractCommand);
  }
}

export { ModuleConnectors };

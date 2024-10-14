import { QueryBus } from "@nestjs/cqrs";
import { Injectable } from "@nestjs/common";
import { UserQuery } from "../../user/service/user.query";
import User from "../domain/user";
import { GetBandMembersQuery } from "../../band/service/getBandMembers.query";
import { BandPrimitives } from "../../band/domain/band";
import { GetBandInfoQuery } from "../../band/service/getBandInfo.query";

@Injectable()
class ModuleConnectors {
  constructor(private queryBus: QueryBus) {}
  async obtainUserInformation(id?: string, email?: string): Promise<User> {
    const userQuery = new UserQuery(id, email);
    return await this.queryBus.execute(userQuery);
  }

  async obtainBandMembers(id: string): Promise<string[]> {
    const getBandMembersQuery = new GetBandMembersQuery(id);
    return await this.queryBus.execute(getBandMembersQuery);
  }

  async obtainBandInformation(id: string): Promise<BandPrimitives> {
    const getBandInfoQuery = new GetBandInfoQuery(id);
    return await this.queryBus.execute(getBandInfoQuery);
  }
}

export { ModuleConnectors };

import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BandRepository } from "../infrastructure/band.repository";
import BandId from "../../shared/domain/bandId";
import { BandProfile } from "../domain/bandProfile";
import { BandNotFoundException } from "../exceptions/bandNotFoundException";
import { GetBandProfileQuery } from "./getBandProfile.query";
import { BookingStatus } from "../../shared/domain/bookingStatus";

@Injectable()
@QueryHandler(GetBandProfileQuery)
export class GetBandProfileQueryHandler
  implements IQueryHandler<GetBandProfileQuery>
{
  constructor(private bandRepository: BandRepository) {}

  async execute(query: GetBandProfileQuery): Promise<BandProfile> {
    const { userId, id } = query;
    const bandId = new BandId(id);
    const bandProfile = await this.bandRepository.getBandProfileById(bandId);
    if (!bandProfile) {
      throw new BandNotFoundException(id);
    }
    const { price, ...shaped } = bandProfile;
    if (!bandProfile.members.find((member) => member.id === userId)) {
      const { members, events, ...bandProfileWithoutMembers } = bandProfile;
      return {
        ...bandProfileWithoutMembers,
        events: events.filter(
          (event) =>
            event.isPublic &&
            (event.status === BookingStatus.ACCEPTED ||
              event.status === BookingStatus.SIGNED ||
              event.status === BookingStatus.PAID),
        ),
      };
    }
    return userId ? bandProfile : shaped;
  }
}

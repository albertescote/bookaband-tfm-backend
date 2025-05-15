import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserIdByBookingIdQuery } from "./getUserIdByBookingId.query";
import { BookingRepository } from "../infrastructure/booking.repository";
import BookingId from "../../shared/domain/bookingId";

@Injectable()
@QueryHandler(GetUserIdByBookingIdQuery)
export class GetUserIdByBookingIdQueryHandler
  implements IQueryHandler<GetUserIdByBookingIdQuery>
{
  constructor(private bookingRepository: BookingRepository) {}

  async execute(query: GetUserIdByBookingIdQuery): Promise<string> {
    const booking = await this.bookingRepository.findById(
      new BookingId(query.id),
    );
    if (!booking) return undefined;

    return booking.getId().toPrimitive();
  }
}

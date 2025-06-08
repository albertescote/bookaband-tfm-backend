import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBookingByIdQuery } from "./getBookingById.query";
import { BookingRepository } from "../infrastructure/booking.repository";
import { BookingNotFoundException } from "../exceptions/bookingNotFoundException";
import BookingId from "../../shared/domain/bookingId";

@Injectable()
@QueryHandler(GetBookingByIdQuery)
export class GetBookingByIdQueryHandler
  implements IQueryHandler<GetBookingByIdQuery>
{
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(query: GetBookingByIdQuery) {
    const booking = await this.bookingRepository.findById(
      new BookingId(query.id),
    );
    if (!booking) {
      throw new BookingNotFoundException(query.id);
    }
    return booking.toPrimitives();
  }
}

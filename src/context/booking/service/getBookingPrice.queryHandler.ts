import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { BookingRepository } from "../infrastructure/booking.repository";
import BookingId from "../../shared/domain/bookingId";
import { GetBookingPriceQuery } from "./getBookingPrice.query";
import { BookingPriceNotFoundException } from "../exceptions/bookingPriceNotFoundException";

@Injectable()
@QueryHandler(GetBookingPriceQuery)
export class GetBookingPriceQueryHandler
  implements IQueryHandler<GetBookingPriceQuery>
{
  constructor(private readonly bookingRepository: BookingRepository) {}

  async execute(query: GetBookingPriceQuery): Promise<number> {
    const bookingPrice = await this.bookingRepository.getBookingPrice(
      new BookingId(query.id),
    );
    if (!bookingPrice) {
      throw new BookingPriceNotFoundException(query.id);
    }
    return bookingPrice;
  }
}

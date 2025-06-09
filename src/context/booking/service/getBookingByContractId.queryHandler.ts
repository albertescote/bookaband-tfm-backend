import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBookingByContractIdQuery } from "./getBookingByContractId.query";
import { BookingRepository } from "../infrastructure/booking.repository";
import { BookingPrimitives } from "../domain/booking";
import ContractId from "../../shared/domain/contractId";

@Injectable()
@QueryHandler(GetBookingByContractIdQuery)
export class GetBookingByContractIdQueryHandler
  implements IQueryHandler<GetBookingByContractIdQuery>
{
  constructor(private bookingRepository: BookingRepository) {}

  async execute(
    query: GetBookingByContractIdQuery,
  ): Promise<BookingPrimitives> {
    const booking = await this.bookingRepository.findByContractId(
      new ContractId(query.id),
    );
    if (!booking) return undefined;

    return booking.toPrimitives();
  }
}

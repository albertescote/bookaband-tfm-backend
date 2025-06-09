import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetContractByBookingIdQuery } from "./getContractByBookingId.query";
import { ContractRepository } from "../infrastructure/contract.repository";
import { ContractPrimitives } from "../domain/contract";
import BookingId from "../../shared/domain/bookingId";

@Injectable()
@QueryHandler(GetContractByBookingIdQuery)
export class GetContractByBookingIdQueryHandler
  implements IQueryHandler<GetContractByBookingIdQuery>
{
  constructor(private contractRepository: ContractRepository) {}

  async execute(
    query: GetContractByBookingIdQuery,
  ): Promise<ContractPrimitives> {
    const contract = await this.contractRepository.findByBookingId(
      new BookingId(query.id),
    );
    if (!contract) return undefined;

    return contract.toPrimitives();
  }
}

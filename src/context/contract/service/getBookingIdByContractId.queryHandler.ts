import { Injectable } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetBookingIdByContractIdQuery } from "./getBookingIdByContractId.query";
import { ContractRepository } from "../infrastructure/contract.repository";
import ContractId from "../domain/contractId";

@Injectable()
@QueryHandler(GetBookingIdByContractIdQuery)
export class GetBookingIdByContractIdQueryHandler
  implements IQueryHandler<GetBookingIdByContractIdQuery>
{
  constructor(private contractRepository: ContractRepository) {}

  async execute(query: GetBookingIdByContractIdQuery): Promise<string> {
    const contract = await this.contractRepository.findById(
      new ContractId(query.id),
    );
    if (!contract) return undefined;

    return contract.getId().toPrimitive();
  }
}

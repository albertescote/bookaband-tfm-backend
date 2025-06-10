import { Injectable } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { ContractSignedEvent } from "../../shared/eventBus/domain/contractSigned.event";
import { InvoiceRepository } from "../infrastructure/invoice.repository";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";

@Injectable()
@EventsHandler(ContractSignedEvent)
export class GenerateInvoiceOnContractSignedEventHandler
  implements IEventHandler<ContractSignedEvent>
{
  constructor(
    private invoiceRepository: InvoiceRepository,
    private moduleConnectors: ModuleConnectors,
  ) {}

  async handle(event: ContractSignedEvent): Promise<void> {
    const { contractId } = event;
    const booking =
      await this.moduleConnectors.getBookingByContractId(contractId);
    if (!booking) {
      throw new Error();
    }
  }
}

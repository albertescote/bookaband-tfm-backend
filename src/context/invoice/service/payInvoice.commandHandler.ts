import { Inject, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InvoiceRepository } from "../infrastructure/invoice.repository";
import { PayInvoiceCommand } from "./payInvoice.command";
import { EventBus } from "../../shared/eventBus/domain/eventBus";
import InvoiceId from "../domain/invoiceId";
import { InvoiceNotFoundException } from "../exceptions/invoiceNotFoundException";
import { UnableToUpdateInvoiceException } from "../exceptions/unableToUpdateInvoiceException";
import { InvoicePaidEvent } from "../../shared/eventBus/domain/invoicePaid.event";
import { BookingIdNotFoundForInvoiceIdException } from "../exceptions/bookingIdNotFoundForInvoiceIdException";
import { Role } from "../../shared/domain/role";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";

@Injectable()
@CommandHandler(PayInvoiceCommand)
export class PayInvoiceCommandHandler
  implements ICommandHandler<PayInvoiceCommand>
{
  constructor(
    private invoiceRepository: InvoiceRepository,
    private moduleConnectors: ModuleConnectors,
    @Inject("EventBus") private eventBus: EventBus,
  ) {}

  async execute(command: PayInvoiceCommand): Promise<void> {
    const { id, authorized } = command;

    if (authorized.role !== Role.Musician) {
      throw new Error();
    }

    const bandId = await this.invoiceRepository.getBandIdByInvoiceId(
      new InvoiceId(id),
    );
    if (!bandId) {
      throw new Error();
    }
    const bandMembersId = await this.moduleConnectors.obtainBandMembers(
      bandId.toPrimitive(),
    );
    if (!bandMembersId.some((memberId) => memberId === authorized.id)) {
      throw new Error();
    }

    const invoice = await this.invoiceRepository.findById(new InvoiceId(id));
    if (!invoice) {
      throw new InvoiceNotFoundException();
    }

    invoice.paid();

    const updated = await this.invoiceRepository.update(invoice);

    if (!updated) {
      throw new UnableToUpdateInvoiceException();
    }

    const bookingId = await this.invoiceRepository.getBookingIdByInvoiceId(
      invoice.getId(),
    );

    if (!bookingId) {
      throw new BookingIdNotFoundForInvoiceIdException(
        invoice.getId().toPrimitive(),
      );
    }

    await this.eventBus.publish(new InvoicePaidEvent(bookingId.toPrimitive()));
  }
}

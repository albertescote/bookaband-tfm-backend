import { Inject, Injectable } from "@nestjs/common";
import { ContractRepository } from "../infrastructure/contract.repository";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import {
  DocumentStatus,
  VidsignerApiWrapper,
} from "../infrastructure/vidsignerApiWrapper";
import { EXTERNAL_URL } from "../../../config";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ProcessSignatureNotificationCommand } from "./processSignatureNotification.command";
import { EventBus } from "../../shared/eventBus/domain/eventBus";
import { ContractSignedEvent } from "../../shared/eventBus/domain/contractSigned.event";
import { UserSignedContractEvent } from "../../shared/eventBus/domain/userSignedContract.event";
import { BandSignedContractEvent } from "../../shared/eventBus/domain/bandSignedContract.event";
import { BaseEvent } from "../../shared/eventBus/domain/baseEvent";

@Injectable()
@CommandHandler(ProcessSignatureNotificationCommand)
export class ProcessSignatureNotificationCommandHandler
  implements ICommandHandler<ProcessSignatureNotificationCommand>
{
  constructor(
    private readonly repository: ContractRepository,
    private readonly moduleConnectors: ModuleConnectors,
    private readonly vidSignerApiWrapper: VidsignerApiWrapper,
    @Inject("EventBus") private eventBus: EventBus,
  ) {}

  async execute(command: ProcessSignatureNotificationCommand): Promise<void> {
    const { DocGUI, Signers, DocStatus } = command;
    const contract = await this.repository.findByVidSignerDocGui(DocGUI);
    if (!contract) {
      return;
    }
    const eventsToPublish: BaseEvent[] = [];

    let modified = false;
    Signers.forEach((signer) => {
      if (signer.SignatureStatus === DocumentStatus.Signed) {
        if (contract.toPrimitives().userName === signer.SignerName) {
          if (!contract.isUserSigned()) {
            contract.setUserSigned();
            modified = true;
            eventsToPublish.push(
              new UserSignedContractEvent(
                contract.getBookingId().toPrimitive(),
              ),
            );
          }
        } else if (!contract.isBandSigned()) {
          contract.setBandSigned();
          modified = true;
          eventsToPublish.push(
            new BandSignedContractEvent(contract.getBookingId().toPrimitive()),
          );
        }
      } else if (signer.SignatureStatus === DocumentStatus.Rejected) {
        contract.failedSignature();
      }
    });

    if (modified) {
      const signedDocument = await this.vidSignerApiWrapper.getDocument(DocGUI);
      const fileName = `contract-${contract.toPrimitives().bookingId}-${Date.now()}.pdf`;
      await this.moduleConnectors.storeFile(fileName, signedDocument);

      contract.updateFileUrl(`${EXTERNAL_URL}/files/${fileName}`);

      if (DocStatus === DocumentStatus.Signed) {
        eventsToPublish.push(
          new ContractSignedEvent(contract.getId().toPrimitive()),
        );
      }
      for (const eventToPublish of eventsToPublish) {
        await this.eventBus.publish(eventToPublish);
      }
    }

    await this.repository.update(contract);
  }
}

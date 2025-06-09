import { Injectable } from "@nestjs/common";
import { ContractRepository } from "../infrastructure/contract.repository";
import { ModuleConnectors } from "../../shared/infrastructure/moduleConnectors";
import { VidsignerApiWrapper } from "../infrastructure/vidsignerApiWrapper";
import { EXTERNAL_URL } from "../../../config";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ProcessSignatureNotificationCommand } from "./processSignatureNotification.command";

@Injectable()
@CommandHandler(ProcessSignatureNotificationCommand)
export class ProcessSignatureNotificationCommandHandler
  implements ICommandHandler<ProcessSignatureNotificationCommand>
{
  constructor(
    private readonly repository: ContractRepository,
    private readonly moduleConnectors: ModuleConnectors,
    private readonly vidSignerApiWrapper: VidsignerApiWrapper,
  ) {}

  async execute(command: ProcessSignatureNotificationCommand): Promise<void> {
    const { DocGUI, Signers } = command;
    const contract = await this.repository.findByVidSignerDocGui(DocGUI);
    if (!contract) {
      return;
    }

    let modified = false;
    Signers.forEach((signer) => {
      if (signer.SignatureStatus === "Signed") {
        if (contract.toPrimitives().userName === signer.SignerName) {
          if (!contract.isUserSigned()) {
            contract.setUserSigned();
            modified = true;
          }
        } else if (!contract.isBandSigned()) {
          contract.setBandSigned();
          modified = true;
        }
      } else if (signer.SignatureStatus === "Rejected") {
        contract.failedSignature();
      }
    });

    if (modified) {
      const signedDocument = await this.vidSignerApiWrapper.getDocument(DocGUI);
      const fileName = `contract-${contract.toPrimitives().bookingId}-${Date.now()}.pdf`;
      await this.moduleConnectors.storeFile(fileName, signedDocument);

      contract.updateFileUrl(`${EXTERNAL_URL}/files/${fileName}`);
    }

    await this.repository.update(contract);
  }
}

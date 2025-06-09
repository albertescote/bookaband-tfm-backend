export class ProcessSignatureNotificationCommand {
  constructor(
    private _Signers: {
      SignerGUI: string;
      SignerName: string;
      SignatureStatus: string;
      TypeOfID: string;
      NumberID: string;
      OperationTime: string;
      RejectionReason?: string | null;
      UserNoticesInfo?: string | null;
      FormInfo?: string | null;
    }[],
    private _FileName: string,
    private _DocGUI: string,
    private _DocStatus: string,
    private _Downloaded: boolean,
    private _AdditionalData?: string,
  ) {}

  get Signers(): {
    SignerGUI: string;
    SignerName: string;
    SignatureStatus: string;
    TypeOfID: string;
    NumberID: string;
    OperationTime: string;
    RejectionReason?: string | null;
    UserNoticesInfo?: string | null;
    FormInfo?: string | null;
  }[] {
    return this._Signers;
  }

  get FileName(): string {
    return this._FileName;
  }

  get DocGUI(): string {
    return this._DocGUI;
  }

  get DocStatus(): string {
    return this._DocStatus;
  }

  get Downloaded(): boolean {
    return this._Downloaded;
  }

  get AdditionalData(): string {
    return this._AdditionalData;
  }
}

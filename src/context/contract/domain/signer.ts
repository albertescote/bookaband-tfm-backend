export interface SignerPrimitives {
  SignatureType: string;
  SignerName: string;
  TypeOfID: string;
  NumberID: string;
  Language: string;
  PhoneNumber: string;
  Email: string;
  Visible: {
    Page: number;
    PosX: number;
    PosY: number;
    SizeX: number;
    SizeY: number;
    SignatureField: string | null;
    Anchor: string;
  };
  NotificationEmailMessage: {
    eMailBody: string;
    eMailSubject: string;
  };
}

const EMAIL_AND_SMS_SIGNATURE_TYPE = "emailandsms";

export class Signer {
  constructor(
    private readonly signatureType: string,
    private readonly signerName: string,
    private readonly typeOfID: string,
    private readonly numberID: string,
    private readonly language: string,
    private readonly phoneNumber: string,
    private readonly email: string,
    private readonly visible: {
      Page: number;
      PosX: number;
      PosY: number;
      SizeX: number;
      SizeY: number;
      SignatureField: string | null;
      Anchor: string;
    },
    private readonly notificationEmailMessage: {
      eMailBody: string;
      eMailSubject: string;
    },
  ) {}

  static createDefault(
    signerName: string,
    typeOfId: "DNI" | "NIF",
    signerIdNumber: string,
    phoneNumber: string,
    email: string,
    fileName: string,
    language: string = "es",
  ): Signer {
    return new Signer(
      EMAIL_AND_SMS_SIGNATURE_TYPE,
      signerName,
      typeOfId,
      signerIdNumber,
      language,
      phoneNumber,
      email,
      {
        Page: 1,
        PosX: 100,
        PosY: 100,
        SizeX: 60,
        SizeY: 30,
        SignatureField: null,
        Anchor: "",
      },
      {
        eMailBody:
          "Por favor, le solicitamos que firme el contrato para que este tenga validez legal. Muchas gracias por su colaboración.",
        eMailSubject: `Firma de contrato ${fileName}`,
      },
    );
  }

  static fromPrimitives(data: SignerPrimitives): Signer {
    return new Signer(
      data.SignatureType,
      data.SignerName,
      data.TypeOfID,
      data.NumberID,
      data.Language,
      data.PhoneNumber,
      data.Email,
      data.Visible,
      data.NotificationEmailMessage,
    );
  }

  toPrimitives(): SignerPrimitives {
    return {
      SignatureType: this.signatureType,
      SignerName: this.signerName,
      TypeOfID: this.typeOfID,
      NumberID: this.numberID,
      Language: this.language,
      PhoneNumber: this.phoneNumber,
      Email: this.email,
      Visible: this.visible,
      NotificationEmailMessage: this.notificationEmailMessage,
    };
  }
}

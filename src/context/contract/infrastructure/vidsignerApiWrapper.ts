import { Injectable } from "@nestjs/common";
import axios from "axios";
import { VIDSIGNER } from "../../../config";
import { FailedToObtainVidSignerAccessTokenException } from "../exceptions/failedToObtainVidSignerAccessTokenException";
import { Signer } from "../domain/signer";
import { FailedToSignDocumentWithVidSignerException } from "../exceptions/failedToSignDocumentWithVidSignerException";
import { FailedToGetDocumentWithVidSignerException } from "../exceptions/failedToGetDocumentWithVidSignerException";

export interface SignatureResponse {
  DocGUI: string;
}

interface GetDocumentResponse {
  FileName: string;
  DocContent: string;
}

export enum DocumentStatus {
  Signed = "Signed",
  Rejected = "Rejected",
  Unsigned = "Unsigned",
}

@Injectable()
export class VidsignerApiWrapper {
  private readonly passwordGrantType = "password";
  private readonly subscriptionScope = "subscription";
  private readonly tokenUrl = `${VIDSIGNER.BASE_URL}/api/v2.1/oauth/token`;
  private readonly documentsUrl = `${VIDSIGNER.BASE_URL}/api/v2.1/documents`;

  constructor() {}

  async signDocument(
    filename: string,
    docContent: Buffer,
    issuerName: string,
    orderedSignatures: boolean,
    signers: Signer[],
    notificationUrl: string,
  ): Promise<SignatureResponse> {
    const accessToken = await this.getAccessToken();

    const payload = {
      FileName: filename,
      DocContent: docContent.toString("base64"),
      IssuerName: issuerName,
      OrderedSignatures: orderedSignatures,
      Signers: signers.map((signer) => signer.toPrimitives()),
      NotificationURL: notificationUrl,
      NotificationConfig: { SignerNotification: true },
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await axios.post(this.documentsUrl, payload, {
        headers,
      });
      return response.data as SignatureResponse;
    } catch (e) {
      throw new FailedToSignDocumentWithVidSignerException(e.message);
    }
  }

  async getDocument(docGui: string): Promise<Buffer> {
    const accessToken = await this.getAccessToken();

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await axios.get(this.documentsUrl + `/${docGui}`, {
        headers,
      });
      const docContent = (response.data as GetDocumentResponse).DocContent;
      return Buffer.from(docContent, "base64");
    } catch (e) {
      throw new FailedToGetDocumentWithVidSignerException(e.message);
    }
  }

  private async getAccessToken(): Promise<string> {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${VIDSIGNER.CLIENT_ID}:${VIDSIGNER.CLIENT_SECRET}`).toString("base64")}`,
    };

    const body = {
      grant_type: this.passwordGrantType,
      username: VIDSIGNER.SUBSCRIPTION_USERNAME,
      password: VIDSIGNER.SUBSCRIPTION_PASSWORD,
      scope: this.subscriptionScope,
    };

    try {
      const response = await axios.post(this.tokenUrl, body, { headers });
      return response.data.access_token;
    } catch (error) {
      throw new FailedToObtainVidSignerAccessTokenException();
    }
  }
}

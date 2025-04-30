export interface EmailTemplate {
  subject: string;
  html(verificationUrl: string): string;
}

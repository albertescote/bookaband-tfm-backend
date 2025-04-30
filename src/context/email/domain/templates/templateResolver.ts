import { EmailTemplate } from "./emailTemplate";
import {
  emailVerificationTemplateCa,
  emailVerificationTemplateEn,
  emailVerificationTemplateEs,
} from "./emailVerificationTemplates";
import {
  passwordResetTemplateCa,
  passwordResetTemplateEn,
  passwordResetTemplateEs,
} from "./passwordResetTemplates";

const emailVerificationTemplates: Record<string, EmailTemplate> = {
  ca: emailVerificationTemplateCa,
  en: emailVerificationTemplateEn,
  es: emailVerificationTemplateEs,
};

const passwordResetTemplates: Record<string, EmailTemplate> = {
  ca: passwordResetTemplateCa,
  en: passwordResetTemplateEn,
  es: passwordResetTemplateEs,
};

export function getEmailVerificationTemplate(lng: string): EmailTemplate {
  return emailVerificationTemplates[lng] ?? emailVerificationTemplates["en"];
}

export function getPasswordTemplate(lng: string): EmailTemplate {
  return passwordResetTemplates[lng] ?? passwordResetTemplates["en"];
}

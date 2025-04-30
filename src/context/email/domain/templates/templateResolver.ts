import { EmailTemplate } from "./emailTemplate";
import {
  emailVerificationTemplateCa,
  emailVerificationTemplateEn,
  emailVerificationTemplateEs,
} from "./emailVerificationTemplates";

const templates: Record<string, EmailTemplate> = {
  ca: emailVerificationTemplateCa,
  en: emailVerificationTemplateEn,
  es: emailVerificationTemplateEs,
};

export function getEmailVerificationTemplate(lng: string): EmailTemplate {
  return templates[lng] ?? templates["en"];
}

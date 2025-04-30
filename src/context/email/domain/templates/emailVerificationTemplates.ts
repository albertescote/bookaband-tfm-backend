import { EmailTemplate } from "./emailTemplate";

export const emailVerificationTemplateCa: EmailTemplate = {
  subject: "Confirma el teu correu electrònic",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Benvingut a BookaBand!</h2>
      <p>Fes clic en aquest enllaç per confirmar el teu correu electrònic:</p>
      <a href="${url}" style="color: #15b7b9;">Confirmar correu</a>
    </div>
  `,
};

export const emailVerificationTemplateEn: EmailTemplate = {
  subject: "Confirm your email address",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>Welcome to BookaBand!</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${url}" style="color: #15b7b9;">Verify email</a>
    </div>
  `,
};

export const emailVerificationTemplateEs: EmailTemplate = {
  subject: "Confirma tu correo electrónico",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>¡Bienvenido a BookaBand!</h2>
      <p>Haz clic en el siguiente enlace para confirmar tu correo electrónico:</p>
      <a href="${url}" style="color: #15b7b9;">Confirmar correo</a>
    </div>
  `,
};

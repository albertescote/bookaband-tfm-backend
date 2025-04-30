import { EmailTemplate } from "./emailTemplate";

export const emailVerificationTemplateCa: EmailTemplate = {
  subject: "Confirma la teva adreça de correu electrònic",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Benvingut a <span style="color: #15b7b9;">BookaBand</span></h2>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          Verifica la teva adreça de correu electrònic per activar el teu compte.
        </p>

        <a href="${url}" target="_blank" style="
          display: inline-block;
          background: linear-gradient(to right, #15b7b9, #0e9fa1);
          color: #ffffff;
          font-weight: bold;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
        ">Verifica el correu</a>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Aquest enllaç caducarà aviat, així que completa la verificació tan aviat com puguis.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 14px; color: #9ca3af;">
          No t’has registrat a BookaBand? Llavors pots ignorar aquest correu sense problema.
        </p>
      </div>
    </div>
  `,
};

export const emailVerificationTemplateEn: EmailTemplate = {
  subject: "Confirm your email address",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Welcome to <span style="color: #15b7b9;">BookaBand</span></h2>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          We're excited to have you on board. Please verify your email address to activate your account.
        </p>

        <a href="${url}" target="_blank" style="
          display: inline-block;
          background: linear-gradient(to right, #15b7b9, #0e9fa1);
          color: #ffffff;
          font-weight: bold;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
        ">Verify Email</a>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          This link will expire soon, so please complete your verification as soon as possible.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 14px; color: #9ca3af;">
          Didn’t sign up for BookaBand? Then you can safely ignore this email.
        </p>
      </div>
    </div>
  `,
};

export const emailVerificationTemplateEs: EmailTemplate = {
  subject: "Confirma tu dirección de correo electrónico",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Bienvenido a <span style="color: #15b7b9;">BookaBand</span></h2>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          Verifica tu dirección de correo electrónico para activar tu cuenta.
        </p>

        <a href="${url}" target="_blank" style="
          display: inline-block;
          background: linear-gradient(to right, #15b7b9, #0e9fa1);
          color: #ffffff;
          font-weight: bold;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
        ">Verificar correo</a>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Este enlace expirará pronto, así que por favor completa la verificación lo antes posible.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 14px; color: #9ca3af;">
          ¿No te has registrado en BookaBand? Entonces puedes ignorar este correo sin problema.
        </p>
      </div>
    </div>
  `,
};

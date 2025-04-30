import { EmailTemplate } from "./emailTemplate";

export const passwordResetTemplateCa: EmailTemplate = {
  subject: "Restableix la teva contrasenya de BookaBand",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Restableix la teva contrasenya</h2>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          Hem rebut una sol·licitud per restablir la teva contrasenya de BookaBand. Fes clic al botó següent per establir-ne una de nova.
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
        ">Restableix la contrasenya</a>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Aquest enllaç caducarà aviat. Si no has sol·licitat aquest restabliment, pots ignorar aquest correu.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 14px; color: #9ca3af;">
          Tens dubtes? Contacta amb el nostre equip de suport quan vulguis.
        </p>
      </div>
    </div>
  `,
};

export const passwordResetTemplateEn: EmailTemplate = {
  subject: "Reset your BookaBand password",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Reset your password</h2>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          We received a request to reset your BookaBand password. Click the button below to set a new one.
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
        ">Reset Password</a>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          This link will expire shortly. If you didn’t request a password reset, you can ignore this email.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 14px; color: #9ca3af;">
          Questions? Contact our support team at any time.
        </p>
      </div>
    </div>
  `,
};

export const passwordResetTemplateEs: EmailTemplate = {
  subject: "Restablece tu contraseña de BookaBand",
  html: (url) => `
    <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 40px; color: #333;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.1); padding: 30px; text-align: center;">
        <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px;">Restablece tu contraseña</h2>
        <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px;">
          Hemos recibido una solicitud para restablecer tu contraseña de BookaBand. Haz clic en el botón de abajo para crear una nueva.
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
        ">Restablecer contraseña</a>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Este enlace caducará pronto. Si no solicitaste un restablecimiento, puedes ignorar este correo.
        </p>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;" />

        <p style="font-size: 14px; color: #9ca3af;">
          ¿Tienes preguntas? Ponte en contacto con nuestro equipo de soporte.
        </p>
      </div>
    </div>
  `,
};

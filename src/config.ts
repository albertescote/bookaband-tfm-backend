import * as dotenv from "dotenv";

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

const FRONTEND_PAGE_URL = checkStrVar(
  process.env.FRONTEND_PAGE_URL,
  "FRONTEND_PAGE_URL",
);
const FRONTEND_AUTH_URL = checkStrVar(
  process.env.FRONTEND_AUTH_URL,
  "FRONTEND_AUTH_URL",
);
const FRONTEND_APP_URL = checkStrVar(
  process.env.FRONTEND_APP_URL,
  "FRONTEND_APP_URL",
);
const RESEND_API_KEY = checkStrVar(
  process.env.RESEND_API_KEY,
  "RESEND_API_KEY",
);

const REDIS = {
  URL: checkStrVar(process.env.REDIS_URL, "REDIS_URL"),
  PORT: checkStrVar(process.env.REDIS_PORT, "REDIS_PORT"),
};

export {
  FRONTEND_PAGE_URL,
  FRONTEND_AUTH_URL,
  FRONTEND_APP_URL,
  RESEND_API_KEY,
  REDIS,
};

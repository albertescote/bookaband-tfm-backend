import * as dotenv from "dotenv";

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

const FRONTEND_URL = checkStrVar(process.env.FRONTEND_URL, "FRONTEND_URL");
const RESEND_API_KEY = checkStrVar(
  process.env.RESEND_API_KEY,
  "RESEND_API_KEY",
);

const REDIS = {
  URL: checkStrVar(process.env.REDIS_URL, "REDIS_URL"),
  PORT: checkStrVar(process.env.REDIS_PORT, "REDIS_PORT"),
};

export { FRONTEND_URL, RESEND_API_KEY, REDIS };

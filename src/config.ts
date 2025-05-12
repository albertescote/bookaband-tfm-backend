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

const MONGO_DB_URL = checkStrVar(process.env.MONGO_DB_URL, "MONGO_DB_URL");
const MONGO_DB_NAME = checkStrVar(process.env.MONGO_DB_NAME, "MONGO_DB_NAME");

enum MONGODB_COLLECTIONS {
  EVENT_TYPES = "event_types",
}

export {
  FRONTEND_URL,
  RESEND_API_KEY,
  REDIS,
  MONGO_DB_URL,
  MONGO_DB_NAME,
  MONGODB_COLLECTIONS,
};

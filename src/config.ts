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

enum MONGODB_COLLECTIONS {
  EVENT_TYPES = "event_types",
  MUSICAL_STYLES = "musical_styles",
}

const REDIS = {
  URL: checkStrVar(process.env.REDIS_URL, "REDIS_URL"),
  PORT: checkStrVar(process.env.REDIS_PORT, "REDIS_PORT"),
};

const MONGO_DB_NAME = checkStrVar(process.env.MONGO_DB_NAME, "MONGO_DB_NAME");

const MONGO_DB_URL = checkStrVar(process.env.MONGO_DB_URL, "MONGO_DB_URL");

export {
  FRONTEND_PAGE_URL,
  FRONTEND_AUTH_URL,
  FRONTEND_APP_URL,
  RESEND_API_KEY,
  REDIS,
  MONGO_DB_NAME,
  MONGO_DB_URL,
  MONGODB_COLLECTIONS,
};

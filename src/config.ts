import * as dotenv from "dotenv";

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

const EXTERNAL_URL = checkStrVar(process.env.EXTERNAL_URL, "EXTERNAL_URL");

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

const VIDSIGNER_BASE_URL = checkStrVar(
  process.env.VIDSIGNER_BASE_URL,
  "VIDSIGNER_BASE_URL",
);
const VIDSIGNER_SUBSCRIPTION_USERNAME = checkStrVar(
  process.env.VIDSIGNER_SUBSCRIPTION_USERNAME,
  "VIDSIGNER_SUBSCRIPTION_USERNAME",
);
const VIDSIGNER_SUBSCRIPTION_PASSWORD = checkStrVar(
  process.env.VIDSIGNER_SUBSCRIPTION_PASSWORD,
  "VIDSIGNER_SUBSCRIPTION_PASSWORD",
);
const VIDSIGNER_CLIENT_ID = checkStrVar(
  process.env.VIDSIGNER_CLIENT_ID,
  "VIDSIGNER_CLIENT_ID",
);
const VIDSIGNER_CLIENT_SECRET = checkStrVar(
  process.env.VIDSIGNER_CLIENT_SECRET,
  "VIDSIGNER_CLIENT_SECRET",
);

const VIDSIGNER = {
  BASE_URL: VIDSIGNER_BASE_URL,
  SUBSCRIPTION_USERNAME: VIDSIGNER_SUBSCRIPTION_USERNAME,
  SUBSCRIPTION_PASSWORD: VIDSIGNER_SUBSCRIPTION_PASSWORD,
  CLIENT_ID: VIDSIGNER_CLIENT_ID,
  CLIENT_SECRET: VIDSIGNER_CLIENT_SECRET,
};

export {
  EXTERNAL_URL,
  FRONTEND_PAGE_URL,
  FRONTEND_AUTH_URL,
  FRONTEND_APP_URL,
  RESEND_API_KEY,
  REDIS,
  MONGO_DB_NAME,
  MONGO_DB_URL,
  MONGODB_COLLECTIONS,
  VIDSIGNER,
};

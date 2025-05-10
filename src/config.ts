import * as dotenv from "dotenv";

dotenv.config();
const FRONTEND_PAGE_URL = process.env.FRONTEND_PAGE_URL;
const FRONTEND_AUTH_URL = process.env.FRONTEND_AUTH_URL;
const FRONTEND_APP_URL = process.env.FRONTEND_APP_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const REDIS = {
  URL: process.env.REDIS_URL,
  PORT: process.env.REDIS_PORT,
};

export {
  FRONTEND_PAGE_URL,
  FRONTEND_AUTH_URL,
  FRONTEND_APP_URL,
  RESEND_API_KEY,
  REDIS,
};

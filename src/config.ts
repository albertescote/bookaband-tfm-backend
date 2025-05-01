import * as dotenv from "dotenv";

dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const REDIS = {
  URL: process.env.REDIS_URL,
  PORT: process.env.REDIS_PORT,
};

export { FRONTEND_URL, RESEND_API_KEY, REDIS };

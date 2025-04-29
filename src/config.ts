import * as dotenv from "dotenv";

dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export { FRONTEND_URL, RESEND_API_KEY };

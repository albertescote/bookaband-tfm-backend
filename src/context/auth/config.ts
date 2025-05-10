import * as dotenv from "dotenv";

dotenv.config();

const checkStrVar = (variable: string | undefined, name: string): string => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  return variable;
};

const checkNumVar = (variable: string | undefined, name: string): number => {
  if (!variable) throw new Error(`undefined variable: ${name}`);
  try {
    return parseInt(variable);
  } catch (e) {
    throw new Error(`variable ${name} is not a number: ${e}`);
  }
};

const AUTHORIZE_SERVICE_PRIVATE_KEY = checkStrVar(
  process.env.AUTHORIZE_SERVICE_PRIVATE_KEY,
  "AUTHORIZE_SERVICE_PRIVATE_KEY",
);

const GOOGLE_CLIENT_ID = checkStrVar(
  process.env.GOOGLE_CLIENT_ID,
  "GOOGLE_CLIENT_ID",
);
const GOOGLE_CLIENT_SECRET = checkStrVar(
  process.env.GOOGLE_CLIENT_SECRET,
  "GOOGLE_CLIENT_SECRET",
);

const TOKEN_TYPE = "Bearer";

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = checkNumVar(
  process.env.ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  "ACCESS_TOKEN_EXPIRES_IN_SECONDS",
);

const REFRESH_TOKEN_EXPIRES_IN_SECONDS = checkNumVar(
  process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  "REFRESH_TOKEN_EXPIRES_IN_SECONDS",
);

const TOKEN_ISSUER = "learning-platform-backend";

export {
  AUTHORIZE_SERVICE_PRIVATE_KEY,
  TOKEN_TYPE,
  ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  REFRESH_TOKEN_EXPIRES_IN_SECONDS,
  TOKEN_ISSUER,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
};

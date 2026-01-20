import { config } from "dotenv";

config();

// Helper to ensure a variable exists
const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  PORT: parseInt(getEnv('PORT', '3000'), 10),

  DB_HOST: getEnv('DB_HOST'),
  DB_USER: getEnv('DB_USER'),
  DB_PASS: getEnv('DB_PASS'),
  DB_NAME: getEnv('DB_NAME'),
  DB_PORT: parseInt(getEnv('DB_PORT', '3306'), 10),

  ADJUTOR_API_KEY: getEnv('ADJUTOR_API_KEY'),
}
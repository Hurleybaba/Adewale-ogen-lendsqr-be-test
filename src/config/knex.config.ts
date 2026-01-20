import { Knex } from "knex";
import { env } from "./env.js";

export const config: Knex.Config = {
  client: "mysql2",
  connection: {
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    port: env.DB_PORT,
    // Critical for production: maintains the connection alive
    multipleStatements: true,
    timezone: "Z"
  },
  pool: {
    min: 2,
    max: 10, // Optimize based on server size. 10 is good for Heroku free tier.
  },
  migrations: {
    directory: "./src/database/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/database/seeds",
    extension: "ts",
  },
};



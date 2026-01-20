import knex from "knex";
import { config } from "../config/knex.config.js";

const db = knex(config);

export default db;

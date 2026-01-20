import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // 1. USERS Table
  await knex.schema.createTable("users", (table) => {
    table.uuid("id").primary(); // Knex maps this to CHAR(36) for MySQL
    table.string("email").unique().notNullable();
    table.string("first_name").notNullable();
    table.string("last_name").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    
    // Index for faster login lookups
    table.index("email");
  });

  // 2. WALLETS Table
  await knex.schema.createTable("wallets", (table) => {
    table.uuid("id").primary();
    // Foreign Key: Link to users table. "ON DELETE CASCADE" means if user is deleted, wallet is deleted.
    table.uuid("user_id").unique().notNullable()
        .references("id").inTable("users").onDelete("CASCADE");
    table.decimal("balance", 14, 2).notNullable().defaultTo(0.00);
    table.string("currency", 3).notNullable().defaultTo("NGN");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

  // 3. TRANSACTIONS Table
  await knex.schema.createTable("transactions", (table) => {
    table.uuid("id").primary();
    table.uuid("wallet_id").notNullable()
        .references("id").inTable("wallets").onDelete("CASCADE");
    table.enum("type", ["FUND", "TRANSFER", "WITHDRAW"]).notNullable();
    table.decimal("amount", 14, 2).notNullable();
    table.string("reference").unique().notNullable();
    table.enum("status", ["PENDING", "SUCCESS", "FAILED"]).notNullable().defaultTo("PENDING");
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Index for fetching wallet history
    table.index("wallet_id");
  });

  // 4. TRANSFERS Table
  await knex.schema.createTable("transfers", (table) => {
    table.uuid("id").primary();
    table.uuid("sender_wallet_id").notNullable()
        .references("id").inTable("wallets").onDelete("CASCADE");
    table.uuid("receiver_wallet_id").notNullable()
        .references("id").inTable("wallets").onDelete("CASCADE");
    table.decimal("amount", 14, 2).notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Indexes for fetching transfers sent vs received
    table.index("sender_wallet_id");
    table.index("receiver_wallet_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  // We drop tables in REVERSE order to avoid foreign key errors
  await knex.schema.dropTableIfExists("transfers");
  await knex.schema.dropTableIfExists("transactions");
  await knex.schema.dropTableIfExists("wallets");
  await knex.schema.dropTableIfExists("users");
}
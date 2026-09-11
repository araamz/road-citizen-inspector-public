import { Kysely, PostgresDialect } from "kysely";
import type { UplinkDatabase } from "@road-citizen-inspector/models/uplink";
import { Pool } from "pg";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.POSTGRES_DB || "rci_uplink_database",
    host: process.env.POSTGRES_HOST || "uplink_db",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    port: Number(process.env.POSTGRES_PORT) || 5432,
  }),
});

const db = new Kysely<UplinkDatabase>({
  dialect,
});
export default db;

import { Kysely, PostgresDialect } from "kysely";
import type { SessionDatabase } from "@road-citizen-inspector/models/session";
import { Pool } from "pg";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.POSTGRES_DB || "rci_session_database",
    host: process.env.POSTGRES_HOST || "session_db",
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    port: Number(process.env.POSTGRES_PORT) || 5432,
  }),
});

const db = new Kysely<SessionDatabase>({
  dialect,
});
export default db;

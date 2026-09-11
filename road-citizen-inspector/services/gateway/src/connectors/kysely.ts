import { Kysely, PostgresDialect } from "kysely";
import type { SessionDatabase } from "@road-citizen-inspector/models/session";
import { Pool } from "pg";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: "rci_session_database",
    host: "session_db",
    user: "postgres",
    password: "postgres",
    port: 5432,
  }),
});

const db = new Kysely<SessionDatabase>({
  dialect,
});
export default db;

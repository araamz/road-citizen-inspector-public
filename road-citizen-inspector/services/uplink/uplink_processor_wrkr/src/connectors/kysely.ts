import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { UplinkDatabase } from "@road-citizen-inspector/models";

const dialect = new PostgresDialect({
  pool: new Pool({
    database: "rci_session_database",
    host: "session_db",
    user: "postgres",
    password: "postgres",
    port: 5432,
  }),
});

const db = new Kysely<UplinkDatabase>({
  dialect,
});
export default db;

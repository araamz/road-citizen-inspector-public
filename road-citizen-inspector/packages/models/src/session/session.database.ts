import type { ProjectTable } from "./project.model.js";
import type { SessionTable } from "./session.model.js";
import type { WebhookKeyTable } from "./webhook_key.model.js";

export interface SessionDatabase {
  session: SessionTable;
  project: ProjectTable;
  webhook_key: WebhookKeyTable;
}
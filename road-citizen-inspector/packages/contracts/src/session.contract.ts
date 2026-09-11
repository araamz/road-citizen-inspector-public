import type {
  Project,
  Session,
  WebhookKey,
} from "@road-citizen-inspector/models/session";
import type { Contract } from "./contract.ts";

// Session Service Contracts

export type SessionData = Pick<
  Session,
  | "session_id"
  | "title"
  | "description"
  | "status"
  | "project_id"
  | "visibility"
  | "tts_app_id"
  | "created_at"
  | "updated_at"
  | "active_at"
>;
export type RemovedSessionData = Pick<
  Session,
  "session_id" | "tts_app_id" | "is_deleted"
>;
export type SessionContract = Contract<SessionData>;
export type DeletedSessionContract = Contract<RemovedSessionData>;

export type ProjectData = Project;

export type ProjectContract = Contract<ProjectData>;

export type SessionClaimData = {
  project: ProjectData;
  session: SessionData;
};
export type SessionClaimContract = Contract<SessionClaimData>;

export type LatestWebhookKeyData = WebhookKey;
export type LatestWebhookKeyContract = Contract<LatestWebhookKeyData>
export type WebhookKeyData = Omit<WebhookKey, "hashed_key"> & {
  hashed_key_preview: string;
};
export type WebhookKeyContract = Contract<WebhookKeyData>;
export type SessionWebhookKeysContract = Contract<WebhookKeyData[]>;

export type SessionGenerationProvisionData = {
  webhookKey: WebhookKey;
  session: SessionData;
};
export type SessionGenerationProvisionContract =
  Contract<SessionGenerationProvisionData>;

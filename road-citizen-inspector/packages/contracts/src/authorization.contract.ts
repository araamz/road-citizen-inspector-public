import type { Contract } from "./contract.js";
import type { SessionData } from "./session.contract.js"

export type AuthorizationData = {
    role: "viewer" | "administrator";
    session: SessionData;
}
export type AuthorizationContract = Contract<AuthorizationData>
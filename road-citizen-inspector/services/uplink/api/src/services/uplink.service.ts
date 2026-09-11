import {
  Uplink,
  UplinkModel,
  UplinkQuery,
  UplinkStatus,
  UplinkUpdate,
} from "@road-citizen-inspector/models/uplink";
import {
  SessionClaimContract,
  SessionContract,
  SessionData,
  WebhookKeyContract,
  WebhookKeyData,
} from "@road-citizen-inspector/contracts";
import Service, { ServiceError } from "./service.js";
import { UplinkProcessorClient } from "@road-citizen-inspector/uplink-processing-jobs";
import { PaginationParams, PaginationResult } from "@road-citizen-inspector/models";
import { DataWriter } from "../utils/DataWriter.js";

export class UplinkService extends Service {
  private uplinkModel: UplinkModel;
  private uplinkProcessorClient: UplinkProcessorClient;

  constructor(
    uplinkModel: UplinkModel,
    uplinkProcessorClient: UplinkProcessorClient,
  ) {
    super();
    this.uplinkModel = uplinkModel;
    this.uplinkProcessorClient = uplinkProcessorClient;
  }

  private UplinkUpdateFailed(message: string, details: Partial<UplinkUpdate>) {
    return new ServiceError(
      `An error occurred while updating uplink. ${message}`,
      "uplink_update_error",
      details,
    );
  }

  private UplinkNotFoundError(
    message: string,
    details: Partial<Pick<Uplink, "uplink_id" | "project_id">>,
  ) {
    return new ServiceError(
      `An error occurred while retreiving requested uplink. ${message}`,
      "uplink_not_found_error",
      details,
    );
  }

  private UplinkCreationError(
    message: string,
    details: Pick<Uplink, "raw_uplink" | "raw_payload" | "tts_device_id">,
  ) {
    return new ServiceError(
      `An error occurred while capturing uplink. ${message}`,
      "uplink_creation_error",
      details,
    );
  }

  private UplinkRejectionError<T = null>(message: string, details: T) {
    return new ServiceError(
      `An error occurred while rejecting uplink. ${message}`,
      "uplink_rejection_error",
      details,
    );
  }

  private ProjectUplinksNotFoundError(
    message: string,
    details: UplinkQuery | undefined
  ) {
    return new ServiceError(
      `An error occurred while retreiving project uplinks. ${message}`,
      "project_uplinks_not_found_error",
      details
    )
  }

  private UplinkFileGenerationFailedError(
    message: string,
    details: UplinkQuery | undefined
  ) {
    return new ServiceError(
      `An error occurred while generating uplink file. ${message}`,
      "status_file_generation_failed",
      details
    )
  }

  private async fetchWebhookKey(
    webhookKey: string,
  ): Promise<null | WebhookKeyData> {
    const response = await fetch(`http://session_api:4001/webhook_key/key`, {
      headers: {
        webhook_key: webhookKey,
      },
    });
    if (!response.ok) return null;
    const { success, data: key } =
      (await response.json()) as WebhookKeyContract;
    if (!success) return null;
    if (key.is_revoked) return null;
    return key;
  }

  private async fetchSession(sessionId: number): Promise<null | SessionData> {
    const response = await fetch(
      `http://session_api:4001/session/${sessionId}`,
    );
    if (!response.ok) return null;
    const { success, data: session } =
      (await response.json()) as SessionContract;
    if (!success) return null;

    return session;
  }

  private async provisionSessionClaiming(sessionId: number, ttsAppId: string) {
    const response = await fetch(
      `http://session_api:4001/provisioning/session_claim`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          tts_app_id: ttsAppId,
        }),
      },
    );
    if (!response.ok) return null;
    const { success, data: provisioning } =
      (await response.json()) as SessionClaimContract;
    if (!success) return null;

    return provisioning;
  }

  async createUplink(
    webhookKey: string,
    ttsAppId: string,
    ttsDeviceId: string,
    rawUplink: string,
    rawPayload: string,
  ) {
    const key = await this.fetchWebhookKey(webhookKey);
    if (!key)
      throw this.UplinkRejectionError(
        "Webhook Key is not valid or revoked.",
        null,
      );

    const session = await this.fetchSession(key.session_id)
      .then((session) => {
        if (!session)
          throw this.UplinkRejectionError(
            "Session is not valid for webhook key.",
            { session_id: key.session_id },
          );
        return session;
      })
      .then(async (session) => {
        if (session.status === "claimed") return session;
        if (session.status === "expired")
          throw this.UplinkRejectionError(
            "Session is expired and can not be modified.",
            {
              session_id: key.session_id,
            },
          );

        const claimedSession = await this.provisionSessionClaiming(
          session.session_id,
          ttsAppId,
        );

        if (!claimedSession)
          throw this.UplinkCreationError(
            "An error occurred while claiming session.",
            {
              raw_uplink: rawUplink,
              raw_payload: rawPayload,
              tts_device_id: ttsDeviceId,
            },
          );

        return claimedSession.session;
      })
      .catch((error) => {
        throw error;
      });

    if (session.tts_app_id !== ttsAppId)
      throw this.UplinkRejectionError(
        "The Things Stack Application Id does not match the session.",
        {
          session_id: key.session_id,
        },
      );

    const createdUplink = await this.uplinkModel
      .createUplink({
        raw_uplink: rawUplink,
        raw_payload: rawPayload,
        project_id: session.project_id,
        tts_device_id: ttsDeviceId,
        status: "unprocessed",
      })
      .then((createdUplink) => {
        if (!createdUplink)
          throw this.UplinkCreationError(
            "An error occurred while saving uplink to database.",
            {
              raw_uplink: rawUplink,
              raw_payload: rawPayload,
              tts_device_id: ttsDeviceId,
            },
          );
        return createdUplink;
      });

    await this.uplinkProcessorClient
      .sendUplink({
        uplink_id: createdUplink.uplink_id,
      })
      .then(() => {
        console.log("Sent uplink to processing queue", createdUplink.uplink_id);
        return createdUplink;
      });

    return createdUplink;
  }

  async getUplink(uplinkId: number) {
    return this.uplinkModel.getUplinkByUplinkId(uplinkId).then((uplink) => {
      if (!uplink)
        throw this.UplinkNotFoundError("Requested uplink was not found.", {
          uplink_id: uplinkId,
        });

      return uplink;
    });
  }

  async updateUplinkStatus(uplinkId: number, status: UplinkStatus) {
    return this.uplinkModel
      .getUplinkByUplinkId(uplinkId)
      .then((uplink) => {
        if (!uplink)
          throw this.UplinkNotFoundError("Update to uplink failed.", {
            uplink_id: uplinkId,
          });

        return uplink;
      })
      .then((uplink) =>
        this.uplinkModel.updateUplink(uplink.uplink_id, {
          status,
        }),
      )
      .then((updatedUplink) => {
        if (!updatedUplink)
          throw this.UplinkUpdateFailed("Updating status for uplink failed.", {
            uplink_id: uplinkId,
            status: status,
          });
        return updatedUplink;
      });
  }

  async getUplinks(
    projectId: number,
    query?: UplinkQuery
  ) {
    return this.uplinkModel.getUplinksByProjectId(projectId, query).then((uplinks) => {
      if (!uplinks)
        throw this.UplinkNotFoundError("No uplinks found for the project.", {
          project_id: projectId,
        });

      return uplinks;
    });
  }

  async getPaginatedUplinks(
    projectId: number,
    query: UplinkQuery | undefined,
    pagination: PaginationParams,
  ): Promise<PaginationResult<Uplink[]>> {
    return this.uplinkModel.getUplinksByProjectIdPaginated(
      projectId,
      query,
      pagination,
    ).then((paginatedUplinks) => {
      if (!paginatedUplinks)
        throw this.UplinkNotFoundError("No uplinks found for the project.", {
          project_id: projectId,
        });
      return paginatedUplinks;
    });
  }

  async getProjectUplinks(
    projectId: number,
    query?: UplinkQuery
  ) {

    return this.uplinkModel.getUplinksByProjectId(
      projectId,
      query
    ).then((uplinks) => {
      if (!uplinks) throw this.ProjectUplinksNotFoundError(
        "No uplinks found with the requested query.",
        query
      )

      return uplinks;
    })
  }

  async createUplinkFile(
    projectId: number,
    query?: UplinkQuery
  ) {

    return this.uplinkModel.getUplinksByProjectId(projectId, query)
      .then((uplinks) => {
        if (!uplinks) throw this.ProjectUplinksNotFoundError(
          "No uplinks found with the requested query.",
          query
        )

        const dw = new DataWriter(uplinks)
        const bytes = dw.bytes(true)

        if (bytes === null) throw this.UplinkFileGenerationFailedError(
          "File bytes was not generated.",
          query
        )

        return bytes

      })

  }

}

import type {
  ColumnType,
  Generated,
  Insertable,
  Kysely,
  Selectable,
  Transaction,
  Updateable,
} from "kysely";
import { Model, type PaginationParams, type PaginationResult } from "../model.js";
import type { UplinkDatabase } from "./uplink.database.js";

export type UplinkStatus = "unprocessed" | "processed" | "failed";

export interface UplinkTable {
  uplink_id: Generated<number>;
  raw_uplink: ColumnType<string, string, never>;
  raw_payload: ColumnType<string, string, never>;
  project_id: ColumnType<number, number, never>;
  tts_device_id: ColumnType<string, string, never>;
  status: UplinkStatus;
  created_at: ColumnType<string, string, never>;
  updated_at: ColumnType<string, string | undefined, string>;
}

export type Uplink = Selectable<UplinkTable>;
export type NewUplink = Insertable<UplinkTable>;
export type UplinkUpdate = Updateable<UplinkTable>;
export type UplinkQuery = {
  created_at_start?: Date,
  created_at_end?: Date,
  updated_at_start?: Date,
  updated_at_end?: Date,
  tts_device_id?: string,
  sort_order?: 'asc' | 'desc',
  unprocessed?: boolean,
  processed?: boolean,
  failed?: boolean,
}

export class UplinkModel extends Model<UplinkDatabase> {
  constructor(kyselyObject: Kysely<UplinkDatabase>) {
    super(kyselyObject);
  }

  async createUplink(
    params: Omit<NewUplink, "created_at" | "uplink_status">,
    trx?: Transaction<UplinkDatabase>,
  ) {
    const currentTimestamp = new Date();

    const result = await (trx ? trx : this.db)
      .insertInto("uplink")
      .values({
        ...params,
        created_at: currentTimestamp.toISOString(),
        status: "unprocessed",
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getUplinkByUplinkId(uplinkId: number) {
    const result = this.db
      .selectFrom("uplink")
      .select([
        "uplink_id",
        "raw_payload",
        "project_id",
        "tts_device_id",
        "status",
        "created_at",
        "updated_at",
      ])
      .where("uplink_id", "=", uplinkId)
      .executeTakeFirst();

    return result;
  }

  async getUplinksByProjectId(
    projectId: number,
    query?: UplinkQuery,
  ) {
    let result = this.db
      .selectFrom("uplink")
      .select([
        "uplink_id",
        "raw_payload",
        "project_id",
        "tts_device_id",
        "status",
        "created_at",
        "updated_at",
      ])
      .where("project_id", "=", projectId)

    if (query) {
      if (query?.created_at_start) result = result.where("uplink.created_at", ">=", query.created_at_start.toISOString());
      if (query?.created_at_end) result = result.where("uplink.created_at", "<=", query.created_at_end.toISOString());
      if (query?.updated_at_start) result = result.where("uplink.updated_at", ">=", query.updated_at_start.toISOString());
      if (query?.updated_at_end) result = result.where("uplink.updated_at", "<=", query.updated_at_end.toISOString());
      if (query.tts_device_id) result = result.where("uplink.tts_device_id", "=", query.tts_device_id)

      if (query?.sort_order) result = result.orderBy("uplink.created_at", query.sort_order);

      const statuses: UplinkStatus[] = [];

      if (query.processed) statuses.push("processed");
      if (query.failed) statuses.push("failed");
      if (query.unprocessed) statuses.push("unprocessed");

      if (statuses.length > 0) {
        result = result.where("uplink.status", "in", statuses);
      }
    }

    return result.execute();
  }

  async getUplinksByProjectIdPaginated(
    projectId: number,
    query: UplinkQuery | undefined,
    pagination: PaginationParams,
  ): Promise<PaginationResult<Uplink[]>> {
    const page = Math.max(1, pagination.page);
    const size = Math.max(1, pagination.size);
    const offset = (page - 1) * size;

    let countQuery = this.db
      .selectFrom("uplink")
      .where("project_id", "=", projectId);

    if (query) {
      if (query.created_at_start) {
        countQuery = countQuery.where(
          "uplink.created_at",
          ">=",
          query.created_at_start.toISOString(),
        );
      }
      if (query.tts_device_id) {
        countQuery = countQuery.where(
          "uplink.tts_device_id",
          "=",
          query.tts_device_id
        );
      }
      if (query.created_at_end) {
        countQuery = countQuery.where(
          "uplink.created_at",
          "<=",
          query.created_at_end.toISOString(),
        );
      }
      if (query.updated_at_start) {
        countQuery = countQuery.where(
          "uplink.updated_at",
          ">=",
          query.updated_at_start.toISOString(),
        );
      }
      if (query.updated_at_end) {
        countQuery = countQuery.where(
          "uplink.updated_at",
          "<=",
          query.updated_at_end.toISOString(),
        );
      }

      const statuses: UplinkStatus[] = [];
      if (query.processed) statuses.push("processed");
      if (query.failed) statuses.push("failed");
      if (query.unprocessed) statuses.push("unprocessed");

      if (statuses.length > 0) {
        countQuery = countQuery.where("uplink.status", "in", statuses);
      }
    }

    const countRow = await countQuery
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirst();

    const count = Number(countRow?.count ?? 0);
    const pages = Math.max(1, Math.ceil(count / size));

    let dataQuery = this.db
      .selectFrom("uplink")
      .select([
        "uplink_id",
        "raw_uplink",
        "raw_payload",
        "project_id",
        "tts_device_id",
        "status",
        "created_at",
        "updated_at",
      ])
      .where("project_id", "=", projectId);

    if (query) {
      if (query.tts_device_id) {
        dataQuery = dataQuery.where(
          "uplink.tts_device_id",
          "=",
          query.tts_device_id
        );
      }
      if (query.created_at_start) {
        dataQuery = dataQuery.where(
          "uplink.created_at",
          ">=",
          query.created_at_start.toISOString(),
        );
      }
      if (query.created_at_end) {
        dataQuery = dataQuery.where(
          "uplink.created_at",
          "<=",
          query.created_at_end.toISOString(),
        );
      }
      if (query.updated_at_start) {
        dataQuery = dataQuery.where(
          "uplink.updated_at",
          ">=",
          query.updated_at_start.toISOString(),
        );
      }
      if (query.updated_at_end) {
        dataQuery = dataQuery.where(
          "uplink.updated_at",
          "<=",
          query.updated_at_end.toISOString(),
        );
      }

      const statuses: UplinkStatus[] = [];
      if (query.processed) statuses.push("processed");
      if (query.failed) statuses.push("failed");
      if (query.unprocessed) statuses.push("unprocessed");

      if (statuses.length > 0) {
        dataQuery = dataQuery.where("uplink.status", "in", statuses);
      }

      if (query.sort_order) {
        dataQuery = dataQuery.orderBy("uplink.created_at", query.sort_order);
      }
    }

    const entries = await dataQuery
      .limit(size)
      .offset(offset)
      .execute();

    return {
      entries,
      page,
      size,
      pages,
      count,
    };
  }


  async getUplinkPayloadByUplinkId(uplinkId: number) {
    const result = this.db
      .selectFrom("uplink")
      .select("raw_uplink")
      .where("uplink_id", "=", uplinkId)
      .executeTakeFirst();

    return result;
  }

  async updateUplink(uplinkId: number, params: Pick<UplinkUpdate, "status">) {
    const currentTimestamp = new Date();
    const result = this.db
      .updateTable("uplink")
      .set({
        ...params,
        updated_at: currentTimestamp.toISOString(),
      })
      .returningAll("uplink")
      .where("uplink_id", "=", uplinkId)
      .executeTakeFirst();
    return result;
  }

}

import type {
  ColumnType,
  Generated,
  Insertable,
  Selectable,
  Transaction,
} from "kysely";
import { Model, type PaginationParams, type PaginationResult } from "../model.js";
import type { UplinkDatabase } from "./uplink.database.js";

export interface StatusTable {
  status_id: Generated<number>;
  device_id: number;
  uplink_id: number;
  project_id: number;
  device_battery_level: number;
  device_storage_level: number;
  device_sensor_status: string;
  status_capture_time: string;
  created_at: ColumnType<string, string, never>;
}

export type Status = Selectable<StatusTable>;
export type NewStatus = Insertable<StatusTable>;
export type StatusQuery = {
  device_ids?: number[],
  sort_order?: "asc" | "desc",
  device_battery_level_minimum?: number;
  device_battery_level_maximum?: number;
  device_storage_level_minimum?: number;
  device_storage_level_maximum?: number;
  device_sensor_status?: string[],
  status_capture_time_start?: Date;
  status_capture_time_end?: Date;
}

export class StatusModel extends Model<UplinkDatabase> {

  async createStatus(
    params: Omit<NewStatus, "created_at">,
    trx?: Transaction<UplinkDatabase>
  ) {
    const currentTimestamp = new Date();

    const result = await (trx ? trx : this.db)
      .insertInto("status")
      .values({
        ...params,
        created_at: currentTimestamp.toISOString(),
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getStatus(statusId: number) {
    const result = this.db
      .selectFrom("status")
      .selectAll("status")
      .where("status_id", "=", statusId)
      .executeTakeFirst();

    return result;
  }

  async getProjectStatus(
    porjectId: number,
    query: StatusQuery | undefined
  ): Promise<Array<Status>> {

    const sortOrder: "asc" | "desc" = query?.sort_order ?? "desc";

    let fiilteredQuery =
      this.db.selectFrom("status")
        .innerJoin("device", "device.device_id", "status.device_id")
        .where("status.project_id", "=", porjectId)
        .where("device.is_hidden", "=", false);

    if (query) {
      const {
        device_ids,
        device_battery_level_minimum,
        device_battery_level_maximum,
        device_sensor_status,
        device_storage_level_minimum,
        device_storage_level_maximum,
        status_capture_time_start,
        status_capture_time_end,
      } = query;

      if (device_ids && device_ids.length > 0)
        fiilteredQuery = fiilteredQuery.where("device.device_id", "in", device_ids);
      if (device_battery_level_minimum)
        fiilteredQuery = fiilteredQuery.where("device_battery_level", ">=", device_battery_level_minimum);
      if (device_battery_level_maximum)
        fiilteredQuery = fiilteredQuery.where("device_battery_level", "<=", device_battery_level_maximum);
      if (device_storage_level_minimum)
        fiilteredQuery = fiilteredQuery.where("device_storage_level", ">=", device_storage_level_minimum);
      if (device_storage_level_maximum)
        fiilteredQuery = fiilteredQuery.where("device_storage_level", "<=", device_storage_level_maximum);
      if (device_sensor_status)
        fiilteredQuery = fiilteredQuery.where("device_sensor_status", "in", device_sensor_status);
      if (status_capture_time_start)
        fiilteredQuery = fiilteredQuery.where("status_capture_time", ">=", new Date(status_capture_time_start).toUTCString());
      if (status_capture_time_end)
        fiilteredQuery = fiilteredQuery.where("status_capture_time", "<=", new Date(status_capture_time_end).toUTCString());
    }

    const data = await fiilteredQuery
      .selectAll("status")
      .orderBy("status.status_capture_time", sortOrder)
      .execute();

    return data;
  }

  async getStatusReadingsByProjectIdPaginated(
    porjectId: number,
    query: StatusQuery | undefined,
    paginationParams: PaginationParams
  ): Promise<PaginationResult<Array<Status>>> {
    const page = Math.max(1, paginationParams.page);
    const size = Math.max(1, Math.min(100, paginationParams.size));
    const offset = (page - 1) * size;

    const sortOrder: "asc" | "desc" = query?.sort_order ?? "desc";

    let fiilteredQuery = this.db.selectFrom("status").innerJoin("device", "device.device_id", "status.device_id").where("status.project_id", "=", porjectId).where("device.is_hidden", "=", false)

    if (query) {
      const {
        device_ids,
        device_battery_level_minimum,
        device_battery_level_maximum,
        device_sensor_status,
        status_capture_time_start,
        device_storage_level_minimum,
        device_storage_level_maximum,
        status_capture_time_end,
      } = query;

      if (device_ids && device_ids.length > 0) {
        fiilteredQuery = fiilteredQuery.where(
          "status.device_id",
          "in",
          device_ids
        );
      }
      if (device_battery_level_minimum) {
        fiilteredQuery = fiilteredQuery.where("device_battery_level", ">=", device_battery_level_minimum);
      }
      if (device_battery_level_maximum) {
        fiilteredQuery = fiilteredQuery.where("device_battery_level", "<=", device_battery_level_maximum);
      }
      if (device_storage_level_minimum) {
        fiilteredQuery = fiilteredQuery.where("device_storage_level", ">=", device_storage_level_minimum);
      }
      if (device_storage_level_maximum) {
        fiilteredQuery = fiilteredQuery.where("device_storage_level", "<=", device_storage_level_maximum);
      }
      if (device_sensor_status) {
        fiilteredQuery = fiilteredQuery.where("device_sensor_status", "in", device_sensor_status);
      }
      if (status_capture_time_start) {
        fiilteredQuery = fiilteredQuery.where("status_capture_time", ">=", status_capture_time_start.toISOString());
      }
      if (status_capture_time_end) {
        fiilteredQuery = fiilteredQuery.where("status_capture_time", "<=", status_capture_time_end.toISOString());
      }
    }

    const countRow = await fiilteredQuery
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirst();

    const total =
      countRow && typeof countRow.count === "bigint"
        ? Number(countRow.count)
        : Number(countRow?.count ?? 0);

    const pages = total === 0 ? 0 : Math.max(1, Math.ceil(total / size));
    const entries = await fiilteredQuery
      .selectAll("status")
      .orderBy("status.status_capture_time", sortOrder)
      .limit(size)
      .offset(offset)
      .execute();

    return {
      entries,
      page,
      size,
      count: total,
      pages,
    };
  }
}

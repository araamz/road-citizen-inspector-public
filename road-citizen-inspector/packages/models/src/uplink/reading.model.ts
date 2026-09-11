import type {
  ColumnType,
  Generated,
  Insertable,
  Kysely,
  Selectable,
  Transaction,
  Updateable,
} from "kysely";
import {
  Model,
  type PaginationParams,
  type PaginationResult,
} from "../model.js";
import type { UplinkDatabase } from "./uplink.database.js";

export interface ReadingTable {
  reading_id: Generated<number>;
  project_id: number;
  device_id: number;
  uplink_id: number;
  vehicle_detection_time: string;
  vehicle_speed: number;
  vehicle_type: string;
  vehicle_direction: string;
  vehicle_lane: number;
  road_type: string;
  road_primary_direction: string;
  road_secondary_direction: string;
  created_at: ColumnType<string, string, never>;
}

export type Reading = Selectable<ReadingTable>;
export type NewReading = Insertable<ReadingTable>;
export type ReadingQuery = {
  device_ids?: number[];
  vehicle_detection_time_start?: Date;
  vehicle_detection_time_end?: Date;
  sort_order?: "asc" | "desc";
  vehicle_speed_minimum?: number;
  vehicle_speed_maximum?: number;
  vehicle_types?: string[];
  vehicle_directions?: string[];
  vehicle_lanes?: number[];
  road_types?: string[];
  road_primary_directions?: string[];
  road_secondary_directions?: string[];
};

export class ReadingModel extends Model<UplinkDatabase> {
  constructor(kyselyObject: Kysely<UplinkDatabase>) {
    super(kyselyObject);
  }

  async createReading(
    params: Omit<NewReading, "created_at">,
    trx?: Transaction<UplinkDatabase>
  ) {
    const currentTimestamp = new Date();

    const result = await (trx ?? this.db)
      .insertInto("reading")
      .values({
        ...params,
        created_at: currentTimestamp.toISOString(),
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getReading(readingId: number) {
    const result = await this.db
      .selectFrom("reading")
      .selectAll("reading")
      .where("reading_id", "=", readingId)
      .executeTakeFirst();

    return result;
  }

  async getProjectReadings(
    projectId: number,
    query: ReadingQuery | undefined
  ): Promise<Array<Reading>> {
    const sortOrder: "asc" | "desc" = query?.sort_order ?? "desc"

    let filiteredQuery =
      this.db.selectFrom("reading")
        .innerJoin("device", "device.device_id", "reading.device_id")
        .where("reading.project_id", "=", projectId)
        .where("device.is_hidden", "=", false);

    if (query) {

      const {
        device_ids,
        vehicle_detection_time_start,
        vehicle_detection_time_end,
        vehicle_speed_maximum,
        vehicle_speed_minimum,
        vehicle_types,
        vehicle_directions,
        vehicle_lanes,
        road_types,
        road_primary_directions,
        road_secondary_directions
      } = query;

      if (device_ids && device_ids.length > 0)
        filiteredQuery = filiteredQuery.where("reading.device_id", "in", device_ids)
      if (vehicle_detection_time_start)
        filiteredQuery = filiteredQuery.where("reading.vehicle_detection_time", ">=", vehicle_detection_time_start.toISOString());
      if (vehicle_detection_time_end)
        filiteredQuery = filiteredQuery.where("reading.vehicle_detection_time", "<=", vehicle_detection_time_end.toISOString());
      if (vehicle_speed_maximum)
        filiteredQuery = filiteredQuery.where("reading.vehicle_speed", "<=", vehicle_speed_maximum);
      if (vehicle_speed_minimum)
        filiteredQuery = filiteredQuery.where("reading.vehicle_speed", ">=", vehicle_speed_minimum);
      if (vehicle_types && vehicle_types.length > 0)
        filiteredQuery = filiteredQuery.where("reading.vehicle_type", "in", vehicle_types);
      if (vehicle_directions && vehicle_directions.length > 0)
        filiteredQuery = filiteredQuery.where("reading.vehicle_direction", "in", vehicle_directions);
      if (vehicle_lanes && vehicle_lanes.length > 0)
        filiteredQuery = filiteredQuery.where("reading.vehicle_lane", "in", vehicle_lanes);
      if (road_types && road_types.length > 0)
        filiteredQuery = filiteredQuery.where("reading.road_type", "in", road_types);
      if (road_primary_directions && road_primary_directions.length > 0)
        filiteredQuery = filiteredQuery.where("reading.road_primary_direction", "in", road_primary_directions);
      if (road_secondary_directions && road_secondary_directions.length > 0)
        filiteredQuery = filiteredQuery.where("reading.road_secondary_direction", "in", road_secondary_directions);
    }

    const data = await filiteredQuery
      .selectAll("reading")
      .orderBy("reading.vehicle_detection_time", sortOrder)
      .execute();

    return data;
  }

  async getReadingsByProjectIdPaginated(
    projectId: number,
    query: ReadingQuery | undefined,
    paginationParams: PaginationParams
  ): Promise<PaginationResult<Array<Reading>>> {
    const page = Math.max(1, paginationParams.page);
    const size = Math.max(1, paginationParams.size);
    const offset = (page - 1) * size;

    const sortOrder: "asc" | "desc" = query?.sort_order ?? "desc";

    let filteredQuery = this.db
      .selectFrom("reading")
      .innerJoin("device", "device.device_id", "reading.device_id")
      .where("reading.project_id", "=", projectId)
      .where("device.is_hidden", "=", false);

    if (query) {
      const {
        device_ids,
        vehicle_detection_time_start,
        vehicle_detection_time_end,
        vehicle_speed_minimum,
        vehicle_speed_maximum,
        vehicle_types,
        vehicle_directions,
        vehicle_lanes,
        road_types,
        road_primary_directions,
        road_secondary_directions,
      } = query;

      if (device_ids && device_ids.length > 0) {
        filteredQuery = filteredQuery.where(
          "reading.device_id",
          "in",
          device_ids
        );
      }

      if (vehicle_detection_time_start) {
        filteredQuery = filteredQuery.where(
          "reading.vehicle_detection_time",
          ">=",
          vehicle_detection_time_start.toISOString()
        );
      }

      if (vehicle_detection_time_end) {
        filteredQuery = filteredQuery.where(
          "reading.vehicle_detection_time",
          "<=",
          vehicle_detection_time_end.toISOString()
        );
      }

      if (vehicle_speed_minimum !== undefined) {
        filteredQuery = filteredQuery.where(
          "reading.vehicle_speed",
          ">=",
          vehicle_speed_minimum
        );
      }

      if (vehicle_speed_maximum !== undefined) {
        filteredQuery = filteredQuery.where(
          "reading.vehicle_speed",
          "<=",
          vehicle_speed_maximum
        );
      }

      if (vehicle_types && vehicle_types.length > 0) {
        filteredQuery = filteredQuery.where(
          "reading.vehicle_type",
          "in",
          vehicle_types
        );
      }

      if (vehicle_directions && vehicle_directions.length > 0) {
        filteredQuery = filteredQuery.where(
          "reading.vehicle_direction",
          "in",
          vehicle_directions
        );
      }

      if (vehicle_lanes && vehicle_lanes.length > 0) {
        filteredQuery = filteredQuery.where(
          "reading.vehicle_lane",
          "in",
          vehicle_lanes
        );
      }

      if (road_types && road_types.length > 0) {
        filteredQuery = filteredQuery.where(
          "reading.road_type",
          "in",
          road_types
        );
      }

      if (road_primary_directions && road_primary_directions.length > 0) {
        filteredQuery = filteredQuery.where(
          "reading.road_primary_direction",
          "in",
          road_primary_directions
        );
      }

      if (road_secondary_directions && road_secondary_directions.length > 0) {
        filteredQuery = filteredQuery.where(
          "reading.road_secondary_direction",
          "in",
          road_secondary_directions
        );
      }
    }

    const countRow = await filteredQuery
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirst();

    const total =
      countRow && typeof countRow.count === "bigint"
        ? Number(countRow.count)
        : Number(countRow?.count ?? 0);

    const pages = total === 0 ? 0 : Math.max(1, Math.ceil(total / size));

    const entries = await filteredQuery
      .selectAll("reading")
      .orderBy("reading.vehicle_detection_time", sortOrder)
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

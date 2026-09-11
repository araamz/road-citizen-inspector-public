import type {
  ColumnType,
  Generated,
  Insertable,
  Kysely,
  Selectable,
  Transaction,
  Updateable,
} from "kysely";
import { Model } from "../model.js";
import type { UplinkDatabase } from "./uplink.database.js";

export interface DeviceTable {
  device_id: Generated<number>;
  tts_device_id: ColumnType<string, string, never>;
  is_pinned: ColumnType<boolean, false, boolean>;
  is_hidden: ColumnType<boolean, false, boolean>;
  label: ColumnType<string | null, never, string | null>;
  description: ColumnType<string | null, never, string | null>;
  project_id: ColumnType<number, number, never>;
  origin_uplink_id: ColumnType<number, number, never>;
  config_reading_id: ColumnType<number | null, never, number>
  created_at: ColumnType<string, string, never>;
  updated_at: ColumnType<string, never, string>;
}

export type Device = Selectable<DeviceTable>;
export type NewDevice = Insertable<DeviceTable>;
export type DeviceUpdate = Updateable<DeviceTable>;

export class DeviceModel extends Model<UplinkDatabase> {
  constructor(kyselyObject: Kysely<UplinkDatabase>) {
    super(kyselyObject);
  }

  async getDeviceConfiguration(deviceId: number) {
    const result = this.db
      .selectFrom('device')
      .leftJoin('reading', 'reading.device_id', 'device.device_id')
      .select([
        'device.config_reading_id',
        'device.created_at',
        'device.description',
        'device.device_id',
        'device.is_hidden',
        'device.is_pinned',
        'device.label',
        'device.origin_uplink_id',
        'device.project_id',
        'device.tts_device_id',
        'device.updated_at',
        'reading.reading_id',
        'reading.road_primary_direction', 
        'reading.road_secondary_direction', 
        'reading.road_type'
      ])
      .orderBy('reading.created_at', 'asc')
      .limit(1)
      .where('device.device_id', '=', deviceId)
      .selectAll()
      .executeTakeFirst()

    return result;
  }

  async createDevice(
    params: Omit<NewDevice, "created_at">,
    trx?: Transaction<UplinkDatabase>
  ) {
    const currentTimestamp = new Date();

    const result = (trx ? trx : this.db)
      .insertInto("device")
      .values({
        ...params,
        created_at: currentTimestamp.toISOString(),
      })
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async updateDeviceByDeviceId(
    deviceId: number,
    updateParams: Omit<DeviceUpdate, "updated_at" | "device_id">
  ) {
    const currentTimestamp = new Date();

    const result = this.db
      .updateTable("device")
      .set({
        ...updateParams,
        updated_at: currentTimestamp.toISOString(),
      })
      .where("device_id", "=", deviceId)
      .returningAll()
      .executeTakeFirst();

    return result;
  }

  async getDeviceByDeviceId(deviceId: number) {
    const result = this.db
      .selectFrom("device")
      .selectAll("device")
      .where("device_id", "=", deviceId)
      .executeTakeFirst();

    return result;
  }

  async getDeviceByCompositeKeys(projectId: number, ttsDeviceId: string) {
    const result = this.db
      .selectFrom("device")
      .selectAll("device")
      .where("project_id", "=", projectId)
      .where("tts_device_id", "=", ttsDeviceId)
      .executeTakeFirst();

    return result;
  }

  async getDevicesByProjectId(projectId: number) {
    let result = this.db
      .selectFrom("device")
      .selectAll("device")
      .where("project_id", "=", projectId)
      .execute()

    return result;
  }
}

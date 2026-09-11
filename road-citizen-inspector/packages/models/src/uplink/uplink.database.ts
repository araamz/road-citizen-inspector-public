import type { DeviceTable } from "./device.model.js";
import type { ReadingTable } from "./reading.model.js";
import type { StatusTable } from "./status.model.js";
import type { UplinkTable } from "./uplink.model.js";

export interface UplinkDatabase {
  uplink: UplinkTable;
  device: DeviceTable;
  status: StatusTable;
  reading: ReadingTable;
}
import { PayloadParserInterface } from "./payload_parser.js";
import type { ReadingUplink, StatusUplink } from "./payload_parser.js";

class Base64Parser extends PayloadParserInterface {
  constructor(payload: string) {
    super(payload);
    this.type();
  }

  type(): number | null {
    if (this.t) return this.t;

    const bin = atob(this.p);
    const bytes = Uint8Array.from(bin, (m) => m.charCodeAt(0)!);

    if (bytes[0] === undefined) return null;

    this.t = bytes[0];
    return this.t;
  }

  reading(): ReadingUplink | null {
    if (this.t !== 0) return null;
    if (this.r) return this.r;

    const bin = atob(this.p);
    const payloadBytes = Uint8Array.from(bin, (m) => m.charCodeAt(0)!);
    if (payloadBytes.length !== 9 || !bin) return null;

    const parsedMessageType = payloadBytes[0]!;

    const vehicleDetectTimeDV = new DataView(new ArrayBuffer(4));
    payloadBytes.slice(1, 5).forEach((byte, index) => {
      vehicleDetectTimeDV.setUint8(index, byte);
    });
    const parsedVehicleDetectTime = vehicleDetectTimeDV.getInt32(0, false);

    const parsedVehicleSpeed = payloadBytes[5]!;
    const parsedVehicleType = (payloadBytes[6]! >> 4) & 0x0f;

    const parsedVehicleDirection = payloadBytes[6]! & 0x0f;

    const parsedVehicleLane = (payloadBytes[7]! >> 4) & 0x0f;
    const parsedRoadType = payloadBytes[7]! & 0x0f;

    const parsedRoadDirection = (payloadBytes[8]! >> 4) & 0x0f;

    return {
      message_type: parsedMessageType,
      vehicle_detection_time: parsedVehicleDetectTime,
      vehicle_speed: parsedVehicleSpeed,
      vehicle_type: parsedVehicleType,
      vehicle_direction: parsedVehicleDirection,
      vehicle_lane: parsedVehicleLane,
      road_type: parsedRoadType,
      road_direction: parsedRoadDirection,
    };
  }

  status(): StatusUplink | null {
    if (this.t !== 1) return null;
    if (this.s) return this.s;

    const bin = atob(this.p);
    const payloadBytes = Uint8Array.from(bin, (m) => m.charCodeAt(0)!);
    if (payloadBytes.length !== 8 || !bin) return null;

    const parsedMessageType = payloadBytes[0]!;

    const parsedDeviceBatteryLevel = payloadBytes[1]!;
    const parsedDeviceStorageLevel = payloadBytes[2]!;

    const parsedSensorStatus = (payloadBytes[3]! >> 4) & 0x0f;

    const statusCaptureTimeDV = new DataView(new ArrayBuffer(4));
    payloadBytes.slice(4, 8).forEach((byte, index) => {
      statusCaptureTimeDV.setUint8(index, byte);
    });
    const parsedStatusCaptureTime = statusCaptureTimeDV.getInt32(0, false);

    return {
      message_type: parsedMessageType,
      device_battery_level: parsedDeviceBatteryLevel,
      device_storage_level: parsedDeviceStorageLevel,
      device_sensor_status: parsedSensorStatus,
      status_capture_time: parsedStatusCaptureTime,
    };
  }
}

export { Base64Parser };

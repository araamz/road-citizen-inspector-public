interface ReadingUplink {
  message_type: number; // 8 bit
  vehicle_detection_time: number; // UNIX timestamp - 32 bit
  vehicle_speed: number; // 8 bit
  vehicle_type: number; // 4 bit
  vehicle_direction: number; // 4 bit
  vehicle_lane: number; // 4 bit
  road_type: number; // 4 bit
  road_direction: number; // 4 bit
} // 68 bits + 4 bits padding = 72 bits / 9 bytes

interface StatusUplink {
  message_type: number; // 8 bit (1 byte)
  device_battery_level: number; // 8 bit (1 byte)
  device_storage_level: number; // 8 bit (1 byte)
  device_sensor_status: number; // 4 bit (0.5 byte - padding: 1 byte)
  status_capture_time: number; // UNIX timestamp - 32 bit (4 bytes)
} // 64 bits / 8 bytes

// Reading Payload
// Byte 1: 00000000
// Byte [2-5]: 01101001 00100010 10001011 10010110
// Byte 6: 01100000
// Byte 7: 0001 (Vehicle Type - 1) - 0001 (Vehicle Direction - 1)
// Byte 8: 0001 (Vehicle Lane - 1) - 0001 (Vehicle Road Type - 1)
// Byte 9: 0001 (Rooad Direction - 10) 0000
// Total:  000000000110100100100010100010111001011001100000000100010001000100010000 (AGkii5ZgEREQ)

abstract class PayloadParserInterface {
  protected p: string;
  protected t?: number;
  protected r?: ReadingUplink;
  protected s?: StatusUplink;

  constructor(payload: string) {
    this.p = payload;
  }

  type(): number | null {
    throw new Error("Abstract method 'type()' must be implemented");
  }

  status(): StatusUplink | null {
    throw new Error("Abstract method 'status()' must be implemented");
  }

  reading(): ReadingUplink | null {
    throw new Error("Abstract method 'reading()' must be implemented");
  }
}

export { PayloadParserInterface };
export type { ReadingUplink, StatusUplink };

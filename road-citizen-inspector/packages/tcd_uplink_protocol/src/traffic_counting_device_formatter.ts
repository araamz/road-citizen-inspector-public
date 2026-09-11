import type { PayloadParserInterface } from "./payload_parser/payload_parser.js";

// Status Payload 
// Byte 0: 00000001 -> Message Type (1 = Status)
// Byte 1: 01100000 -> Device Battery Level (0-100)
// Byte 2: 01011000 -> Device Storage Level (0-100)
// Byte 3: 00010000 -> Device Sensor Status (0 = OK, 1 = Error) + Padding (4 bits)
// Byte 4-7: 01101001 00011011 10100110 01100100 -> Status Capture Time (UNIX Timestamp)
// Payload Hash64: AWBgAGkbpmQ=

// Reading Payload
// Byte 0: 00000000 -> Message Type (0 = Reading)
// Byte 1-4: 01101001 00011011 10100110 01100100 -> Vehicle Detection Time (UNIX Timestamp)
// Byte 5: 00110010 -> Vehicle Speed (0-255 km/h)
// Byte 6: 00010010 -> Vehicle Type (0001 = Car) + Vehicle Direction (0010 = North East)
// Byte 7: 00010010 -> Vehicle Lane (0001 = Lane 1) + Road Type (0010 = Single Direction Single Lane)
// Byte 8: 00010000 -> Road Primary/Secondary Direction (0001 = North/South)
// Payload Hash64: AAGaMkgCEgE=

type TCDF_UNKNOWN_VALUE = "unknown"
type TCDF_MESSAGE_TYPE = "reading" | "status";
type TCDF_VEHICLE_TYPE = "car" | "truck" | "motorcycle" | TCDF_UNKNOWN_VALUE;
// -1 in the event the direction is not being recorded for Single Lane
type TCDF_DIRECTION_TYPE =
  | "north"
  | "south"
  | "east"
  | "west"
  | "northwest"
  | "southwest"
  | "northeast"
  | "southeast"
// sdsl = single direction single lane
// sddl = single direction double lane
// ddsl = double direction single lane
// dddl = double direction double lane
type TCDF_ROAD_TYPE = "sdsl" | "sddl" | "ddsl" | "dddl";
type TCDF_SENSOR_STATUS = "ok" | "error";
type TCDF_Reading = {
  message_type: TCDF_MESSAGE_TYPE;
  vehicle_detection_time: string;
  vehicle_speed: number;
  vehicle_type: TCDF_VEHICLE_TYPE;
  vehicle_direction: TCDF_DIRECTION_TYPE;
  vehicle_lane: number;
  road_type: TCDF_ROAD_TYPE;
  road_primary_direction: TCDF_DIRECTION_TYPE;
  road_secondary_direction: TCDF_DIRECTION_TYPE;
};
type TCDF_Status = {
  message_type: TCDF_MESSAGE_TYPE;
  device_battery_level: number;
  device_storage_level: number;
  device_sensor_status: TCDF_SENSOR_STATUS;
  status_capture_time: string;
};
type TCDF_Message = {
  message_type: TCDF_MESSAGE_TYPE
}
class TrafficCountingDeviceFormatter {
  private payloadParser?: PayloadParserInterface;
  private m?: TCDF_Message & (TCDF_Reading | TCDF_Status);



  constructor(parser?: PayloadParserInterface) {
    if (!parser) return;
    this.payloadParser = parser;
    if (this.payloadParser.type() === null) throw new Error("Payload is null");
    if (this.payloadParser.type() === 0) {
      if (!this.payloadParser.reading()) throw new Error("Payload is null");

      const {
        message_type,
        vehicle_detection_time,
        vehicle_speed,
        vehicle_type,
        vehicle_direction,
        vehicle_lane,
        road_type,
        road_direction,
      } = this.payloadParser.reading()!;

      if (vehicle_lane < 1 || vehicle_lane > 4) throw new Error("Invalid vehicle lane.");
      this.m = {
        message_type: this.messageType(message_type),
        vehicle_detection_time: new Date(vehicle_detection_time * 1000).toISOString(),
        vehicle_speed: vehicle_speed,
        vehicle_type: this.vehicleType(vehicle_type),
        vehicle_direction: this.directionType(vehicle_direction),
        vehicle_lane: vehicle_lane,
        road_type: this.roadType(road_type),
        road_primary_direction: this.roadDirectionType(road_direction).primary,
        road_secondary_direction: this.roadDirectionType(road_direction).secondary,
      };
    } else if (this.payloadParser.type() === 1) {
      if (!this.payloadParser.status()) throw new Error("Payload is null");
      const {
        message_type,
        device_battery_level,
        device_storage_level,
        device_sensor_status,
        status_capture_time,
      } = this.payloadParser.status()!;
      this.m = {
        message_type: this.messageType(message_type),
        device_battery_level: device_battery_level,
        device_storage_level: device_storage_level,
        device_sensor_status: this.sensorStatus(device_sensor_status),
        status_capture_time: new Date(status_capture_time * 1000).toISOString()
      };
    } else throw new Error("Invalid message type.");
  }

  private messageType(value: number): TCDF_MESSAGE_TYPE {
    if (value === 0) return "reading";
    if (value === 1) return "status";
    throw new Error("Invalid message type.");
  }

  private vehicleType(value: number): TCDF_VEHICLE_TYPE {
    if (value === 0) return "unknown";
    if (value === 1) return "car";
    if (value === 2) return "truck";
    if (value === 3) return "motorcycle";
    throw new Error("Invalid vehicle type.");
  }

  private directionType(value: number): TCDF_DIRECTION_TYPE {
    if (value === 1) return "north";
    if (value === 2) return "northeast";
    if (value === 3) return "east";
    if (value === 4) return "southeast";
    if (value === 5) return "south";
    if (value === 6) return "southwest";
    if (value === 7) return "west";
    if (value === 8) return "northwest";
    throw new Error("Invalid vehicle direction.");
  }

  private roadType(value: number): TCDF_ROAD_TYPE {
    if (value === 1) return "sddl";
    if (value === 2) return "sdsl";
    if (value === 3) return "dddl";
    if (value === 4) return "ddsl";
    throw new Error("Invalid road type.");
  }

  private roadDirectionType(value: number): {
    primary: TCDF_DIRECTION_TYPE,
    secondary: TCDF_DIRECTION_TYPE
  } {
    if (value === 1) return {
      primary: "north",
      secondary: "south"
    }
    if (value === 2) return {
      primary: "south",
      secondary: "north"
    }
    if (value === 3) return {
      primary: "east",
      secondary: "west"
    }
    if (value === 4) return {
      primary: "west",
      secondary: "east"
    }
    if (value === 5) return {
      primary: "northwest",
      secondary: "southeast"
    }
    if (value === 6) return {
      primary: "southwest",
      secondary: "northeast"
    }
    if (value === 7) return {
      primary: "northeast",
      secondary: "southwest"
    }
    if (value === 8) return {
      primary: "southeast",
      secondary: "northwest"
    }
    throw new Error(`Invalid road direction. Value: ${value}`)
  }

  private sensorStatus(value: number): TCDF_SENSOR_STATUS {
    if (value === 0) return "ok";
    if (value === 1) return "error";
    throw new Error("Invalid sensor status.");
  }

  public message(): Promise<TCDF_Message> {
    return new Promise((resolve, reject) => {
      if (this.m !== undefined) return resolve(this.m);
      reject();
    });
  }


  public messageTypeValue(value: TCDF_MESSAGE_TYPE): number {
    if (value === "reading") return 0;
    if (value === "status") return 1;
    throw new Error("Invalid message type.");
  }

  public vehicleTypeValue(value: TCDF_VEHICLE_TYPE): number {
    if (value === "unknown") return 0;
    if (value === "car") return 1;
    if (value === "truck") return 2;
    if (value === "motorcycle") return 3;
    throw new Error("Invalid vehicle type.");
  }

  public directionTypeValue(value: TCDF_DIRECTION_TYPE): number {
    if (value === "north") return 1;
    if (value === "northeast") return 2;
    if (value === "east") return 3;
    if (value === "southeast") return 4;
    if (value === "south") return 5;
    if (value === "southwest") return 6;
    if (value === "west") return 7;
    if (value === "northwest") return 8;
    throw new Error("Invalid direction.");
  }

  public roadTypeValue(value: TCDF_ROAD_TYPE): number {
    if (value === "sddl") return 1;
    if (value === "sdsl") return 2;
    if (value === "dddl") return 3;
    if (value === "ddsl") return 4;
    throw new Error("Invalid road type.");
  }

  public sensorStatusValue(value: TCDF_SENSOR_STATUS): number {
    if (value === "ok") return 0;
    if (value === "error") return 1;
    throw new Error("Invalid sensor status.");
  }

  public roadDirectionValue(
    primary: TCDF_DIRECTION_TYPE,
    secondary: TCDF_DIRECTION_TYPE
  ): number {

    if (primary === "north" && secondary === "south") return 1;
    if (primary === "south" && secondary === "north") return 2;
    if (primary === "east" && secondary === "west") return 3;
    if (primary === "west" && secondary === "east") return 4;
    if (primary === "northwest" && secondary === "southeast") return 5;
    if (primary === "southwest" && secondary === "northeast") return 6;
    if (primary === "northeast" && secondary === "southwest") return 7;
    if (primary === "southeast" && secondary === "northwest") return 8;

    throw new Error("Invalid road direction pair.");
  }
}

export { TrafficCountingDeviceFormatter };
export type {
  TCDF_Reading,
  TCDF_Status,
  TCDF_MESSAGE_TYPE,
  TCDF_VEHICLE_TYPE,
  TCDF_DIRECTION_TYPE,
  TCDF_ROAD_TYPE,
  TCDF_SENSOR_STATUS,
  TCDF_UNKNOWN_VALUE
};

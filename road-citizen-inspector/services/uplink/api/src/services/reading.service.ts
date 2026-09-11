import { PaginationParams, PaginationResult, Reading, ReadingModel, ReadingQuery } from "@road-citizen-inspector/models";
import Service, { ServiceError } from "./service.js";
import { UplinkService } from "./uplink.service.js";
import { DeviceService } from "./device.service.js";
import { DataWriter } from "../utils/DataWriter.js";

export class ReadingService extends Service {
  private deviceService: DeviceService;
  private uplinkService: UplinkService;
  private readingModel: ReadingModel;

  constructor(
    readingModel: ReadingModel,
    uplinkService: UplinkService,
    deviceService: DeviceService
  ) {
    super();
    this.readingModel = readingModel;
    this.uplinkService = uplinkService;
    this.deviceService = deviceService;
  }

  private ReadingCreationError(
    message: string,
    details: {
      device_id: number;
      uplink_id: number;
      vehicle_detection_time: string;
      vehicle_speed: number;
      vehicle_lane: number;
      vehicle_type: string | undefined;
      vehicle_direction: string | undefined;
      road_type: string;
      road_primary_direction: string;
      road_secondary_direction: string;
    }
  ) {
    return new ServiceError(
      `An error occurred while creating a reading. ${message}`,
      "reading_creation_error",
      details
    );
  }

  private ReadingNotFoundError(
    message: string,
    details: Partial<Pick<Reading, "reading_id" | "project_id">>
  ) {
    return new ServiceError(
      `An error occurred while retrieving a reading. ${message}`,
      "reading_not_found_error",
      details
    );
  }

  private ReadingFileGenerationFailedError(
    message: string,
    details: ReadingQuery | undefined
  ) {
    return new ServiceError(
      `An error occurred while generating reading file. ${message}`,
      "reading_file_generation_failed",
      details
    )
  }

  async createReading(
    deviceId: number,
    uplinkId: number,
    vehicleDetectionTime: string,
    vehicleSpeed: number,
    vehicleLane: number,
    vehicleType: string,
    vehicleDirection: string,
    roadType: string,
    roadPrimaryDirection: string,
    roadSecondaryDirection: string
  ) {
    const result = await this.uplinkService
      .getUplink(uplinkId)
      .then(() => this.deviceService.getDevice(deviceId))
      .then((device) =>
        this.readingModel.createReading({
          device_id: deviceId,
          uplink_id: uplinkId,
          project_id: device.project_id,
          vehicle_detection_time: vehicleDetectionTime,
          vehicle_speed: vehicleSpeed,
          vehicle_lane: vehicleLane,
          vehicle_type: vehicleType,
          vehicle_direction: vehicleDirection,
          road_type: roadType,
          road_primary_direction: roadPrimaryDirection,
          road_secondary_direction: roadSecondaryDirection,
        })
      )
      .then((reading) => {
        if (!reading)
          throw this.ReadingCreationError("Reading could not be created.", {
            device_id: deviceId,
            uplink_id: uplinkId,
            vehicle_detection_time: vehicleDetectionTime,
            vehicle_speed: vehicleSpeed,
            vehicle_lane: vehicleLane,
            vehicle_type: vehicleType,
            vehicle_direction: vehicleDirection,
            road_type: roadType,
            road_primary_direction: roadPrimaryDirection,
            road_secondary_direction: roadSecondaryDirection,
          });
        return reading;
      });

    return result;
  }

  async getReading(readingId: number) {
    const result = await this.readingModel
      .getReading(readingId)
      .then((reading) => {
        if (!reading)
          throw this.ReadingNotFoundError("Reading not found.", {
            reading_id: readingId,
          });
        return reading;
      });
  }

  async getProjectReadingsPaginated(projectId: number, pagination: PaginationParams, query?: ReadingQuery): Promise<PaginationResult<Reading[]>> {

    return this.readingModel.getReadingsByProjectIdPaginated(projectId, query, pagination).then((paginategReadings) => {
      if (!paginategReadings) throw this.ReadingNotFoundError("Readings for project not found.", {
        project_id: projectId,
      });

      return paginategReadings;
    });
  }

  async getProjectReadings(projectId: number, query?: ReadingQuery) {
    return this.readingModel.getProjectReadings(projectId, query).then((readings) => {
      if (!readings) throw this.ReadingNotFoundError("Readings for project not found.", {
        project_id: projectId
      })

      return readings;
    })
  }

  async createReadingFile(
    porjectId: number,
    query?: ReadingQuery
  ) {
    return this.readingModel.getProjectReadings(
      porjectId,
      query
    ).then((readings) => {
      if (!readings) throw this.ReadingNotFoundError("Readings for project not found.", {
        project_id: porjectId
      })

      const dw = new DataWriter(readings)
      const readingBytes = dw.bytes(true)

      if (!readingBytes) throw this.ReadingFileGenerationFailedError(
        "Failed to generate reading bytes.",
        query
      )

      return readingBytes;
    })
  }
}

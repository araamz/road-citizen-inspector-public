import { Device, PaginationParams, PaginationResult, Status, StatusModel, StatusQuery } from "@road-citizen-inspector/models";
import { DeviceService } from "./device.service.js";
import Service, { ServiceError } from "./service.js";
import { UplinkService } from "./uplink.service.js";
import { APP_THRESHOLDS } from "../constants.js";
import { DataWriter } from "../utils/DataWriter.js";

export type StatusError = {
  threshold: number
  present: boolean
}
export type StatusErrorSummary = {
  error: {
    battery: StatusError,
    storage: StatusError
  } | null,
}

export class StatusService extends Service {
  private statusModel: StatusModel;
  private deviceService: DeviceService;
  private uplinkService: UplinkService;

  constructor(
    statusModel: StatusModel,
    deviceService: DeviceService,
    uplinkService: UplinkService
  ) {
    super();
    this.statusModel = statusModel;
    this.deviceService = deviceService;
    this.uplinkService = uplinkService;
  }

  private StatusCreationError(
    message: string,
    details: Pick<
      Status,
      | "device_id"
      | "uplink_id"
      | "device_battery_level"
      | "device_storage_level"
      | "device_sensor_status"
    >
  ) {
    return new ServiceError(
      `An error occurred while creating a reading. ${message}`,
      "status_creation_error",
      details
    );
  }

  private ProjectStatusNotFoundError(
    message: string,
    deatils: Partial<Pick<Status, "project_id">>
  ) {
    return new ServiceError(
      `Failed to retrieve statuses. ${message}`,
      "project_status_not_found_error",
      deatils
    )
  }

  private StatusNotFoundError(
    message: string,
    details: Partial<Pick<Status, "status_id" | "project_id">>
  ) {
    return new ServiceError(
      `Failed to retrieve status. ${message}`,
      "status_not_found_error",
      details
    );
  }

  private StatusFileGenerationFailedError(
    message: string,
    details: StatusQuery | undefined
  ) {
    return new ServiceError(
      `An error occurred while generating status file. ${message}`,
      "status_file_generation_failed",
      details
    )
  }

  async createStatus(
    deviceId: number,
    uplinkId: number,
    deviceBatteryLevel: number,
    deviceStorageLevel: number,
    deviceSensorStatus: string,
    statusCaptureTime: string
  ) {
    return this.uplinkService
      .getUplink(uplinkId)
      .then(() => this.deviceService.getDevice(deviceId))
      .then((device) =>
        this.statusModel.createStatus({
          device_id: deviceId,
          uplink_id: uplinkId,
          project_id: device.project_id,
          device_battery_level: deviceBatteryLevel,
          device_storage_level: deviceStorageLevel,
          device_sensor_status: deviceSensorStatus,
          status_capture_time: statusCaptureTime
        })
      )
      .then((status) => {
        if (!status)
          throw this.StatusCreationError(
            "Saving status from uplink has failed.",
            {
              device_id: deviceId,
              uplink_id: uplinkId,
              device_battery_level: deviceBatteryLevel,
              device_storage_level: deviceStorageLevel,
              device_sensor_status: deviceSensorStatus,
            }
          );

        return status;
      });
  }

  async getStatus(statusId: number) {
    return this.statusModel.getStatus(statusId).then((status) => {
      if (!status)
        this.StatusNotFoundError("Status record could not be found.", {
          status_id: statusId,
        });

      return status;
    });
  }

  async getPaginatedStatus(projectId: number, query: StatusQuery | undefined, paginationParams: PaginationParams) {
    return this.statusModel.getStatusReadingsByProjectIdPaginated(
      projectId,
      query,
      paginationParams
    ).then((status) => {
      if (!status) throw this.StatusNotFoundError("Status records could not be found.", {
        project_id: projectId,
      });
      return status;
    });
  }

  async getStatuses(
    projectId: number,
    query?: StatusQuery
  ) {
    return this.statusModel.getProjectStatus(projectId, query).then((statuses) => {
      if (!statuses) this.ProjectStatusNotFoundError(
        "Project status result is empty.",
        {
          project_id: projectId
        }
      )

      return statuses;

    })
  }

  async getLatestDeviceStatus(deviceId: number) {

    const formatErrorSummary = (status: Status): StatusErrorSummary => {
      if (status.device_sensor_status === 'ok') {
        return {
          error: null
        }
      } else {

        const storageErrorPresent = status.device_storage_level < APP_THRESHOLDS.low_sensor_storage
        const batteryErrorPresent = status.device_battery_level < APP_THRESHOLDS.low_sensor_battery

        return {
          error: {
            storage: {
              threshold: APP_THRESHOLDS.low_sensor_storage,
              present: storageErrorPresent
            },
            battery: {
              threshold: APP_THRESHOLDS.low_sensor_battery,
              present: batteryErrorPresent
            }
          }
        }
      }
    }

    const device = await this.deviceService.getDevice(deviceId)

    return this.statusModel.getProjectStatus(device.project_id, {
      sort_order: "desc",
      device_ids: [device.device_id]
    }).then((status) => {

      const latestStatus = status[0]
      const { error } = formatErrorSummary(latestStatus)

      return {
        status: latestStatus,
        device,
        errorSummary: error
      };
    })
  }

  async createStatusFile(
    projectId: number,
    query?: StatusQuery
  ) {

    return this.statusModel.getProjectStatus(projectId, query).then((statuses) => {
      if (!statuses) this.ProjectStatusNotFoundError(
        "Project status result is empty.",
        {
          project_id: projectId
        }
      )

      const dw = new DataWriter(statuses)
      const bytes = dw.bytes(true)

      if (bytes === null) throw this.StatusFileGenerationFailedError(
        "File bytes was not generated.",
        query
      )

      return bytes;

    })
  }
}

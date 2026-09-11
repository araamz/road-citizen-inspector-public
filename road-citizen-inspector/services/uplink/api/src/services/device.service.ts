import {
  Device,
  DeviceModel,
  DeviceUpdate,
  NewDevice,
  Reading,
} from "@road-citizen-inspector/models";
import Service, { ServiceError } from "./service.js";
import {
  ProjectContract,
  ProjectData,
} from "@road-citizen-inspector/contracts";

export class DeviceService extends Service {
  private deviceModel: DeviceModel;

  constructor(deviceModel: DeviceModel) {
    super();
    this.deviceModel = deviceModel;
  }

  private DevicesNotFoundError(
    message: string,
    params: Pick<Device, "project_id">
  ) {
    return new ServiceError(message, "project_not_found_error", params);
  }

  private DeviceCreationError(
    message: string,
    params: Omit<NewDevice, "created_at" | "is_pinned" | "is_hidden">
  ) {
    return new ServiceError(
      `Failed to create new device. ${message}`,
      "device_creation_error",
      params
    );
  }

  private DeviceNotFoundError(
    message: string,
    params: Partial<Pick<Device, "device_id" | "project_id" | "tts_device_id">>
  ) {
    return new ServiceError(
      `An error occurred getting device. ${message}`,
      "device_not_found_error",
      params
    );
  }

  private DeviceUpdateError(
    message: string,
    params: Partial<
      Pick<Device, "device_id" | "description" | "label" | "is_pinned" | "config_reading_id">
    >
  ) {
    return new ServiceError(
      `An error occurred updating device. ${message}`,
      "device_update_error",
      params
    );
  }

  private async verifyProjectExistance(
    projectId: number
  ): Promise<null | ProjectData> {
    const response = await fetch(
      `http://session_api:4001/project/${projectId}`
    );
    if (!response.ok) return null;

    const { success, data: project } =
      (await response.json()) as ProjectContract;
    if (!success) return null;

    return project;
  }

  createDevice(projectId: number, ttsDeviceId: string, originUplinkId: number) {
    return this.deviceModel
      .createDevice({
        project_id: projectId,
        tts_device_id: ttsDeviceId,
        origin_uplink_id: originUplinkId,
        is_hidden: false,
        is_pinned: false,
      })
      .then((device) => {
        if (!device)
          throw this.DeviceCreationError("An unexpected error occurred.", {
            project_id: projectId,
            origin_uplink_id: originUplinkId,
            tts_device_id: ttsDeviceId,
          });

        return device;
      });
  }

  getDevice(deviceId: number) {
    return this.deviceModel.getDeviceByDeviceId(deviceId).then((device) => {
      if (!device)
        throw this.DeviceNotFoundError("Device is not found. Failed to retreive device configuration.",
          {
            device_id: deviceId,
          }
        );
      return device;
    });
  }

  getDeviceConfiguration(deviceId: number) {

    return this.deviceModel.getDeviceConfiguration(deviceId).then((deviceCfg) => {
      if (!deviceCfg) throw this.DeviceNotFoundError(
        "Device not found. Failed to retreive device configuration.",
        {
          device_id: deviceId
        }
      )

      const { road_primary_direction, road_secondary_direction, road_type, reading_id, ...rest } = deviceCfg
      let partialReading = null
      if (road_primary_direction && road_secondary_direction && road_type && reading_id) partialReading = {
        road_primary_direction,
        road_secondary_direction,
        road_type,
        reading_id
      }

      const device: Device = {
        project_id: rest.project_id,
        created_at: rest.created_at,
        updated_at: rest.updated_at,
        device_id: rest.device_id,
        tts_device_id: rest.tts_device_id,
        is_pinned: rest.is_pinned,
        is_hidden: rest.is_hidden,
        label: rest.label,
        description: rest.description,
        origin_uplink_id: rest.origin_uplink_id,
        config_reading_id: rest.config_reading_id
      }


      return {
        device,
        reading: partialReading
      };
    })
  }

  getProjectDevices(projectId: number) {
    return this.verifyProjectExistance(projectId)
      .then((project) => {
        if (!project)
          throw this.DevicesNotFoundError(
            "Error occurred retriving project devices. Project does not exist.",
            {
              project_id: projectId,
            }
          );
        return project;
      })
      .then((project) =>
        this.deviceModel.getDevicesByProjectId(project.project_id)
      )
      .then((devices) => {
        if (!devices)
          throw this.DevicesNotFoundError(
            "Error occurred retriving project devices. An unexpected error occurred.",
            {
              project_id: projectId,
            }
          );
        return devices;
      });
  }

  getDeviceByComposite(projectId: number, ttsDeviceId: string) {
    return this.deviceModel
      .getDeviceByCompositeKeys(projectId, ttsDeviceId)
      .then((device) => {
        if (!device)
          throw this.DeviceNotFoundError(
            "Device not found using composite key combination.",
            {
              project_id: projectId,
              tts_device_id: ttsDeviceId,
            }
          );

        return device;
      });
  }

  updateDevice(
    deviecId: number,
    updateParams: Pick<DeviceUpdate, "description" | "label" | "is_pinned" | "is_hidden">
  ) {
    return this.deviceModel
      .getDeviceByDeviceId(deviecId)
      .then((device) => {
        if (!device)
          throw this.DeviceNotFoundError("Device update has failed.", {
            device_id: deviecId,
          });

        return this.deviceModel.updateDeviceByDeviceId(deviecId, updateParams);
      })
      .then((updatedDevice) => {
        if (!updatedDevice)
          throw this.DeviceUpdateError(
            "Device details could not be updated.",
            updateParams
          );

        return updatedDevice;
      });
  }

  linkDeviceConfiguration(
    deviceId: number,
    configReadingId: number
  ) {
    return this.deviceModel.getDeviceByDeviceId(deviceId).then((device) => {
      if (!device) {
        throw this.DeviceNotFoundError(
          "Device not found. Device configuration link failed.",
          {
            device_id: deviceId,
          }
        )
      }

      if (!device?.origin_uplink_id) {
        throw this.DeviceUpdateError(
          "Device configuration link already exists. Device configuration link failed.",
          {
            device_id: device.device_id,
            config_reading_id: device.config_reading_id
          }
        )
      }

      return this.deviceModel.updateDeviceByDeviceId(deviceId, {
        config_reading_id: configReadingId
      });
    }).then((updatedDevice) => {
      if (!updatedDevice) throw this.DeviceUpdateError(
        "Device configuration link failed.",
        {
          device_id: deviceId,
          config_reading_id: configReadingId
        }
      )

      return updatedDevice;
    })
  }
}

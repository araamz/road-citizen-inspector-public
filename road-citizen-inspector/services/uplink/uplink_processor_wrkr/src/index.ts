// Uplink Processor Worker - Application Modeling

import {
  DeviceContract,
  DeviceData,
  UplinkContract,
  UplinkData,
  ContractError,
  ReadingContract,
  ReadingData,
  StatusContract,
  StatusData,
} from "@road-citizen-inspector/contracts";
import {
  Reading,
  Status,
  Uplink,
  UplinkDatabase,
  UplinkStatus,
  UplinkUpdate,
} from "@road-citizen-inspector/models";
import { Kysely } from "kysely";
import {
  Base64Parser,
  TCDF_Reading,
  TCDF_Status,
  TrafficCountingDeviceFormatter,
} from "@road-citizen-inspector/tcd-uplink-protocol";
import { uplinkProcessorClient } from "./connectors/uplink_processing_client.js";
import db from "./connectors/kysely.js";
import { UplinkProcessorMessage } from "@road-citizen-inspector/uplink-processing-jobs";
import { serverMap } from "@road-citizen-inspector/server-map/map";

// 1. Receive Incoming Uplink Processing Job
// 2. Query database for the raw uplink given the uplink_id.
// 3. If not found, cancel the job and put the uplink_id in the DLQ (i.e., acknowledge you got the job)
// 4. See if the Device for the Project exists, if not create it.
// 5a. If device exists, check if DevId matches Payload DevId
// 5b. If deosnt exist, create new Device with Project Id and DevId/
// 5. If found, decrypt the payload to see if its a status or a reading.
// 6a. If a reading, send to the API to save.
// 6b. If status, send to the API to save.

class UplinkProcessorWorker {
  db: Kysely<UplinkDatabase>;

  constructor(database: Kysely<UplinkDatabase>) {
    this.db = database;
  }

  private async lookupUplink(uplinkId: number): Promise<UplinkData | null> {
    const response = await fetch(`${serverMap.services.RCI_UPLINK_API}/uplink/${uplinkId}`);
    if (!response.ok) return null;
    const { success, data: uplink } = (await response.json()) as UplinkContract;
    if (!success) return null;
    return uplink;
  }

  private async verifyDevice(
    projectId: number,
    ttsDeviceId: string,
    uplinkId: number
  ): Promise<DeviceData | null> {
    const searchParams = new URLSearchParams({
      project_id: String(projectId),
      tts_device_id: ttsDeviceId,
    });

    const queryResponse = await fetch(
      `${serverMap.services.RCI_UPLINK_API}/device/composite/query?${searchParams.toString()}`
    );

    // console.log(queryResponse)
    // if (!queryResponse.ok) return null;
    const {
      success: querySuccess,
      data: device,
      error,
    } = (await queryResponse.json()) as DeviceContract &
    ContractError<{
      name: string;
      details: {
        project_id: number;
        tts_device_id: string;
      };
    }>;
    if (querySuccess) return device;
    if (!querySuccess && error === undefined) return null;
    if (!queryResponse && error && !(error.name === "DEVICE_NOT_FOUND_ERROR"))
      return null;
    const provisionResponse = await fetch(`${serverMap.services.RCI_UPLINK_API}/device`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: projectId,
        tts_device_id: ttsDeviceId,
        uplink_id: uplinkId,
      }),
    });
    if (!provisionResponse.ok) return null;
    const { success: provisionSuccess, data: provisionedDevice } =
      (await provisionResponse.json()) as DeviceContract;
    if (!provisionSuccess) return null;
    return provisionedDevice;
  }

  private async createStatus(
    deviceId: number,
    uplinkId: number,
    status: TCDF_Status
  ): Promise<StatusData | null> {
    const response = await fetch(`${serverMap.services.RCI_UPLINK_API}/status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_id: deviceId,
        uplink_id: uplinkId,
        device_battery_level: status.device_battery_level,
        device_storage_level: status.device_storage_level,
        device_sensor_status: status.device_sensor_status,
        status_capture_time: status.status_capture_time,
      }),
    });

    console.log(`${serverMap.services.RCI_UPLINK_API}/status`)

    if (!response.ok) {
      console.log("Status creation response not ok:", response.status, response.statusText);
      return null;
    };
    const { success, data } = (await response.json()) as StatusContract;
    if (success) return data;
    return null;
  }

  private async createReading(
    deviceId: number,
    uplinkId: number,
    reading: TCDF_Reading
  ): Promise<ReadingData | null> {
    const response = await fetch(`${serverMap.services.RCI_UPLINK_API}/reading`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        device_id: deviceId,
        uplink_id: uplinkId,
        vehicle_detection_time: reading.vehicle_detection_time,
        vehicle_speed: reading.vehicle_speed,
        vehicle_lane: reading.vehicle_lane,
        vehicle_type: reading.vehicle_type,
        vehicle_direction: reading.vehicle_direction,
        road_type: reading.road_type,
        road_primary_direction: reading.road_primary_direction,
        road_secondary_direction: reading.road_secondary_direction,
      }),
    });
    const { success, data } = (await response.json()) as ReadingContract;
    if (success) return data;
    return null;
  }

  private async updateUplinkStatus(
    uplinkId: number,
    status: UplinkStatus
  ): Promise<UplinkData | null> {
    console.log("Updating uplink", uplinkId, "to status", status);
    const response = await fetch(`${serverMap.services.RCI_UPLINK_API}/uplink/${uplinkId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) return null;
    const { success, data } = (await response.json()) as UplinkContract;
    if (!success) return null;
    return data;
  }

  private async linkDeviceConfiguration(deviceId: number, readingId: number) {
    const response = await fetch(`${serverMap.services.RCI_UPLINK_API}/device/${deviceId}/config`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config_reading_id: readingId
      })
    })

    if (!response.ok) throw new Error("Failed to create device config linkage.");

    const { success, data } = (await response.json()) as DeviceContract;

    if (!success) throw new Error("Failed to create device config linkage.");

    return data;
  }

  public async handle(uplink: UplinkProcessorMessage): Promise<boolean> {
    console.log("Began processing new uplink.", uplink);

    const foundUplink = await this.lookupUplink(uplink.uplink_id);
    if (!foundUplink) return false;
    let device = await this.verifyDevice(
      foundUplink.project_id,
      foundUplink.tts_device_id,
      foundUplink.uplink_id
    );

    if (!device) {
      console.log("Device didn't update succesfully, suspending uplink operation.")
      await this.updateUplinkStatus(foundUplink.uplink_id, "failed");
      return false;
    }

    try {
      const tcd_msg = await new TrafficCountingDeviceFormatter(
        new Base64Parser(foundUplink.raw_payload),
      ).message();

      if (tcd_msg.message_type === "reading") {
        const reading = tcd_msg as TCDF_Reading;


        const createdReading = await this.createReading(
          device.device_id,
          uplink.uplink_id,
          reading
        );

        if (!createdReading) return false;

        // From newly created reading -> use it to link if device doesn't have config linked already
        if (device.config_reading_id === null) {
          console.log("Attempting device linkage with the following parameters: (deviceId, readingId)", device.device_id, createdReading.device_id)
          device = await this.linkDeviceConfiguration(device.device_id, createdReading.reading_id)
        }

      } else if (tcd_msg.message_type === "status") {
        const status = tcd_msg as TCDF_Status;
        const createdStatus = await this.createStatus(
          device.device_id,
          uplink.uplink_id,
          status,
        );
        if (!createdStatus) return false;
      } else {
        console.log("Payload wasn't created successfully, suspending uplink operation.")
        await this.updateUplinkStatus(foundUplink.uplink_id, "failed");
        return false;
      }
    } catch (error) {
      console.log("Payload wasn't decoded successfully, suspending uplink operation.", error)
      await this.updateUplinkStatus(foundUplink.uplink_id, "failed");
      return false;
    }

    console.log("Uplink processed", uplink);
    await this.updateUplinkStatus(foundUplink.uplink_id, "processed");

    return true;
  }
}

const wrkr = new UplinkProcessorWorker(db);

await uplinkProcessorClient
  .init()
  .then(() => {
    console.log("Connection established to Exchange Queue.");
  })
  .catch((error) => {
    console.error("Connection not established to Exchange Queue.", error);
    process.exit(1);
  });

uplinkProcessorClient.receiveUplink((uplink) => wrkr.handle(uplink));

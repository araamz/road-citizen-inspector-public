#!/usr/bin/env node
import { type Project } from "@road-citizen-inspector/models/session"
import { DeviceModel, type UplinkDatabase, type Device, type NewDevice, type Reading, type NewUplink, type Uplink, type NewReading, type Status, type NewStatus } from "@road-citizen-inspector/models/uplink"
import { Kysely, PostgresDialect, sql } from 'kysely'
import { parseIntoClientConfig } from 'pg-connection-string'
import { Pool } from 'pg'
import type { DeviceContract, DeviceData, DevicesContract, SessionContract, SessionData, UplinkContract } from "@road-citizen-inspector/contracts";
import type { TCDF_DIRECTION_TYPE, TCDF_MESSAGE_TYPE, TCDF_Reading, TCDF_ROAD_TYPE, TCDF_SENSOR_STATUS, TCDF_Status, TCDF_VEHICLE_TYPE } from "@road-citizen-inspector/tcd-uplink-protocol"
import { Base64Parser, TrafficCountingDeviceFormatter } from "@road-citizen-inspector/tcd-uplink-protocol"
import yargs from 'yargs';
import chalk from "chalk";
import { hideBin } from 'yargs/helpers';
import seedrandom from "seedrandom"
import { fromZonedTime } from 'date-fns-tz';

// Assume direct access to container (uplink_api, uplink_db) over a tunnel

const successMessage = (headingMessage: string = "Success", ...args: Array<any>) => console.log(
    chalk.green.bold(headingMessage.toUpperCase()), ...args
)

const noticeMessage = (headingMessage: string = "Notice", ...args: Array<any>) => console.warn(
    chalk.cyan.bold(headingMessage.toUpperCase()), ...args
)

const warnMessage = (headingMessage: string = "Warn", ...args: Array<any>) => console.warn(
    chalk.yellow.bold(headingMessage.toUpperCase()), ...args
)

const errorMessage = (headingMessage: string = "Error", ...args: Array<any>) => console.error(
    chalk.bgRed.bold(headingMessage.toUpperCase()), ...args
)

const TIME_OF_DAY = ["morning", "afternoon", "base"] as const
type TimeOfDayKey = typeof TIME_OF_DAY[number]

// Assume 24 hr. format
type TimeOfDayRange = Record<TimeOfDayKey, {
    startHr: number,
    endHr: number
} | null>

const TOD_RANGES: TimeOfDayRange = {
    morning: {
        startHr: 5,
        endHr: 9
    },
    afternoon: {
        startHr: 15,
        endHr: 19
    },
    base: null
}

type DirectionPair = Pick<
    TCDF_Reading,
    "road_primary_direction" | "road_secondary_direction"
>;

type GeneratedReading = Pick<TCDF_Reading,
    "vehicle_detection_time" |
    "vehicle_speed" |
    "vehicle_type" |
    "vehicle_direction" |
    "vehicle_lane" |
    "road_type" |
    "road_primary_direction" |
    "road_secondary_direction"
>

type GeneratedStatus = Pick<TCDF_Status,
    | "device_battery_level"
    | "device_storage_level"
    | "device_sensor_status"
    | "status_capture_time"
>

type DeviceTemplate = {
    directions: DirectionPair
    type: TCDF_ROAD_TYPE,
    tts_device_id: string;
    speedLimitMph: number;
    dbDeviceId: number | null;
    peakDirections: Record<TimeOfDayKey, TCDF_DIRECTION_TYPE | null>
}

type ReadingComposite = {
    deviceTemplate: DeviceTemplate,
    readings: Array<GeneratedReading>,
    start: Date
}

type StatusComposite = {
    deviceTemplate: DeviceTemplate,
    status: Array<GeneratedStatus>,
    start: Date
}

// Typing for Uplink Endpoint (pretending to be TTS)
type tts_UplinkContract = {
    uplink_message: {
        application_ids: {
            application_id: string
        },
        device_id: string;
        frm_payload: string;
    },
}

type EntryComposite<DataType, InsertedDataType> = {
    mappedTemplate: DeviceTemplate
    data: Array<DataType>;
    inserted: {
        uplinks: Array<Uplink>;
        data: Array<InsertedDataType>
    }
}

const directionPairings: Record<string, DirectionPair> = {
    "n-s": { road_primary_direction: "north", road_secondary_direction: "south" },
    "s-n": { road_primary_direction: "south", road_secondary_direction: "north" },
    "w-e": { road_primary_direction: "west", road_secondary_direction: "east" },
    "e-w": { road_primary_direction: "east", road_secondary_direction: "west" },
    "ne-sw": { road_primary_direction: "northeast", road_secondary_direction: "southwest" },
    "sw-ne": { road_primary_direction: "southwest", road_secondary_direction: "northeast" },
    "nw-se": { road_primary_direction: "northwest", road_secondary_direction: "southeast" },
    "se-nw": { road_primary_direction: "southeast", road_secondary_direction: "northwest" },
} as const;

let deviceTemplates: Array<DeviceTemplate> = [
    {
        directions: directionPairings['n-s']!,
        type: 'dddl',
        tts_device_id: 'uni_virginia_st',
        speedLimitMph: 25,
        dbDeviceId: null,
        peakDirections: {
            afternoon: 'north',
            morning: null,
            base: null
        }
    },
    {
        directions: directionPairings['e-w']!,
        type: 'ddsl',
        tts_device_id: 'uni_9th_st',
        speedLimitMph: 25,
        dbDeviceId: null,
        peakDirections: {
            afternoon: 'east',
            morning: 'west',
            base: 'east'
        }
    },
    {
        directions: directionPairings['n-s']!,
        type: 'sddl',
        tts_device_id: 'lemmon_s_lemmon_dr',
        speedLimitMph: 45,
        dbDeviceId: null,
        peakDirections: {
            afternoon: 'north',
            morning: null,
            base: null
        }
    },
    {
        directions: directionPairings['ne-sw']!,
        type: 'sdsl',
        tts_device_id: 'coldsprings_village_pwky',
        speedLimitMph: 35,
        dbDeviceId: null,
        peakDirections: {
            morning: null,
            afternoon: 'northeast',
            base: null
        }
    }
]

seedrandom("xerxes", {
    global: true
})

const {
    session: session_id,
    key: session_webhook_key,
    tts_app_id,
    session_server_address,
    connect_string,
    uplink_server_address,
    provision,
    mean_vpm,
    timezone
} = yargs(hideBin(process.argv)).options({
    session: {
        type: 'number',
        demandOption: true,
        alias: 's'
    },
    key: {
        type: 'string',
        demandOption: true,
        alias: 'k'
    },
    tts_app_id: {
        type: 'string',
        demandOption: true,
        alias: 'a'
    },
    connect_string: {
        type: 'string',
        demandOption: false,
        default: process.env['DATABASE_CONNECT_STRING'],
        alias: 'cs'
    },
    mean_vpm: {
        type: 'number',
        demandOption: false,
        alias: 'vpm'
    },
    uplink_server_address: {
        type: 'string',
        demandOption: false,
        default: process.env['UPLINK_SERVER_ADDRESS'],
        alias: 'u_addr'
    },
    session_server_address: {
        type: 'string',
        demandOption: false,
        default: process.env['SESSION_SERVER_ADDRESS'],
        alias: 's_addr'
    },
    provision: {
        type: 'boolean',
        default: false,
        alias: 'p'
    },
    timezone: {
        type: 'string',
        default: 'UTC',
        alias: 'tz',
        describe: 'IANA Timezone string (e.g., America/Los_Angeles)'
    }
}).parseSync()

function getHourInTimezone(date: Date, tz: string): number {
    const raw = Number(
        new Intl.DateTimeFormat("en-US", {
            timeZone: tz,
            hour: "2-digit",
            hour12: false,
        }).format(date)
    );
    // Intl with hour12:false can return 24 for midnight in some environments; normalise it.
    return raw === 24 ? 0 : raw;
}

function adjustWithTimezone(date: Date, tz: string): number {
    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const parts = fmt.formatToParts(date);
    const hash: Record<string, string> = {};

    parts.forEach((p) => {
        hash[p.type] = p.value;
    });

    const localMidnight = `${hash.year}-${hash.month}-${hash.day} 00:00:00`;
    return fromZonedTime(localMidnight, tz).getTime();
}

// Logging out variables used for Session Seeding 
noticeMessage("Session Server Address (ENV)", session_server_address)
noticeMessage("Database Server Connect String (ENV)", connect_string)
noticeMessage("Session ID (PARAM)", session_id)
noticeMessage("Session Webhook Key (PARAM)", session_webhook_key)
noticeMessage("Provision (PARAM)", provision)

function gaussian(x: number, mean: number, sigma: number) {
    const z = (x - mean) / sigma;
    return Math.exp(-0.5 * Math.pow(z, 2));
}

function poisson(lambda: number): number {

    // NOTE: f(x, L) = P(x = x) = ((L^x) * (e^-L))/x! 
    //       We are looking for the x! factorial to make it such that x happening in the space of L
    //       L = lambda

    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;

    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k - 1;
}

function select<T>(items: Array<T>, weights?: Array<number>) {
    if (!weights) return items[Math.floor(Math.random() * items.length)]
    if (items.length !== weights.length)
        throw new Error("(randomlySelect) The number of items do not match the number of weights.")

    const weightsSum = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * weightsSum;

    for (let idx = 0; idx < items.length; idx++) {
        r -= weights[idx] ?? 0;
        if (r <= 0) return items[idx]
    }

    return items[items.length - 1];

}

function clamp(n: number, low: number, high: number) {
    return Math.max(low, Math.min(high, n));
}

// Battery Uplinks
const IDLE_BATT_CURRENT_MA = 80
const ACTIVE_BATT_CHARGE_PER_VEHICLE_MAH = 5
const BATT_CAPACITY_MAH = 2200
const HOURLY_UPLINK_MAX = 22

function sampleBatteryPercentage(
    vehicleCount: number,
    previousCapacityPercent: number = 100
) {
    const idleChargeMah = IDLE_BATT_CURRENT_MA / 60;
    const detectionChargeMah = vehicleCount * ACTIVE_BATT_CHARGE_PER_VEHICLE_MAH;

    const usedCapacityPercent = ((idleChargeMah + detectionChargeMah) / BATT_CAPACITY_MAH) * 100;

    return clamp(Math.floor(previousCapacityPercent - usedCapacityPercent), 0, 100);
};

// Assume for at most SF7, overheadSize: 13, payload: 9; 530 messages (src: https://avbentem.github.io/airtime-calculator/ttn/us915/9)
const MESSAGE_BYTES = 9
const DEVICE_STORAGE_BYTES = 4 * 1024 * 1000;
function sampleStoragePercentage(vehicleCount: number, previousCapacityPercent: number) {
    const queuedMessageCount = vehicleCount - HOURLY_UPLINK_MAX;

    if (queuedMessageCount < 0) return previousCapacityPercent;

    const usedPercent = (MESSAGE_BYTES * queuedMessageCount) / DEVICE_STORAGE_BYTES

    return Math.floor(previousCapacityPercent - usedPercent);
}

// Reading Uplinks 
function sampleTrafficGaussianIntensity(hour: number): number {
    const morning = gaussian(hour, 5.5, 1.1);
    const afternoon = gaussian(hour, 15.0, 1.0);
    const base = 0.12;
    return clamp(base + 0.9 * morning + 0.95 * afternoon, 0, 1);
}

function sampleLane(minLane: number, maxLane: number) {
    return Math.floor(Math.random() * (maxLane - minLane + 1)) + minLane;
}

function laneCount(type: TCDF_ROAD_TYPE) {
    if (type === "dddl") return 4
    if (type === "ddsl") return 2
    if (type === "sddl") return 4
    if (type === "sdsl") return 2;
    else throw new Error("(function::laneCount): Unknown value for lane config.")
}

// TODO (04/26): This is partially working...need to test. 
function sampleLaneWeights(
    hour: number,
    peakDirections: DeviceTemplate['peakDirections'],
    roadType: TCDF_ROAD_TYPE,
    pair: DirectionPair
): Array<number> | undefined {

    const tod = Object.entries(TOD_RANGES).map(
        ([tod, range]) => {
            if (!range) return null

            if (range.startHr <= hour && hour <= range.endHr) {
                return tod as TimeOfDayKey;
            }

            return null;
        }).find((tod) => tod !== null)

    if (!tod) return undefined

    const peakDirection = peakDirections[tod]

    if (!peakDirection) return undefined

    if (peakDirection === pair.road_primary_direction) {
        if (roadType === "dddl") return [0.7, 0.6, 0.25, 0.35]
        if (roadType === "ddsl") return [0.75, 0.25]
        if (roadType === "sddl") return undefined
        if (roadType === "sdsl") return [1, 0]
    } else {
        if (roadType === "dddl") return [0.25, 0.35, 0.7, 0.6]
        if (roadType === "ddsl") return [0.25, 0.75]
        if (roadType === "sddl") return undefined
        if (roadType === "sdsl") return [0, 1]
    }

}

// TODO (03/12): Fix this such that the road type if SLSD, SLDD, the secondary direction never gets sampled - FIXED...I Think (4/1/2026)
function sampleDirection(
    pair: DirectionPair,
    roadType?: TCDF_ROAD_TYPE,
    laneWeights?: Array<number>
) {

    if (roadType && laneWeights && (laneCount(roadType) === laneWeights.length)) {

        const directions: Array<TCDF_DIRECTION_TYPE> = []

        for (let lane = 0; lane < laneCount(roadType); lane++) {
            if (lane < (laneCount(roadType) / 2)) {
                directions.push(pair.road_primary_direction)
            } else {
                directions.push(pair.road_secondary_direction)
            }
        }

        // Lane weights are conformed for selection a direction.
        return select<TCDF_DIRECTION_TYPE>(directions, laneWeights)!
    } else {

        const directions = [pair.road_primary_direction, pair.road_secondary_direction]
        if (roadType === 'dddl' || roadType === 'ddsl') {
            // Equal weight given to each direction
            return select<TCDF_DIRECTION_TYPE>(directions)!;
        } else {
            return select<TCDF_DIRECTION_TYPE>(directions, [1, 0])!
        }
    }
}

function sampleVehicleType(intensity: number): TCDF_VEHICLE_TYPE {
    const vehicleOptions: TCDF_VEHICLE_TYPE[] = ["car", "truck", "motorcycle", "unknown"];
    return select<TCDF_VEHICLE_TYPE>(
        vehicleOptions,
        [
            0.7 + 0.2 * intensity,
            0.15 - 0.08 * intensity,
            0.05 + 0.03 * (1 - intensity),
            0.03,
        ]
    )!;
}

function sampleSpeedMph(
    speedLimit: number,
    intensity: number,
    vehicleType: TCDF_VEHICLE_TYPE
) {
    const congestionMultiplier = 1 - 0.4 * intensity;

    const typeMult =
        vehicleType === "truck"
            ? 0.85
            : vehicleType === "motorcycle"
                ? 1.05
                : vehicleType === "unknown"
                    ? 0.95
                    : 1;

    const noise = 0.95 + Math.random() * 0.1;

    return Math.round(clamp(speedLimit * congestionMultiplier * typeMult * noise, 1, speedLimit * 1.25));
}

function generateStatus24hrs(device: DeviceTemplate, start: Date): StatusComposite {
    const status: Array<GeneratedStatus> = []
    // const alignedStart = new Date(start).setUTCHours(0, 0, 0, 0)

    const alignedStart = adjustWithTimezone(start, timezone)

    noticeMessage(
        "Status Window",
        `Timezone: ${timezone} | Local midnight → UTC: ${new Date(alignedStart).toISOString()} | Window end: ${new Date(alignedStart + 24 * 60 * 60_000).toISOString()}`
    )

    // Assume for at most SF7, overheadSize: 13, payload: 9; 530 messages (src: https://avbentem.github.io/airtime-calculator/ttn/us915/9)
    // In this case, a uplink sends a status every hour.
    // TODO - DONE (1hr): Implement Battery Sampling 
    // TODO - DONE (1hr): Implement Storage Sampling. Make it such that in times of increased busy activity, the storage sampling slightly increases
    // TODO (20min): Make it such that the battery make start at differnt percentages (exp. time span is 20 hrs).
    // TODO - DONE: (10min) Make it such that if the storage drops below 20% or battery drops below 20%, flag a error 

    for (let minute = 0; minute < 24 * 60; minute++) {
        if (minute % 60 !== 0) continue

        const withinMs = Math.floor(Math.random() * 60_000);

        const bucket = new Date(alignedStart + minute * 60_000)
        const hour = getHourInTimezone(bucket, timezone)
        const intensity = sampleTrafficGaussianIntensity(hour)

        const meanVpm = 2 + (mean_vpm ?? 35) * intensity;
        const vehicleCount = poisson(meanVpm)

        const timestamp = new Date(bucket.getTime() + withinMs)

        // Incrased Traffic => Increased Battery Life and Increased Storage Levels

        const prevIndex = (minute / 60) - 1;
        const storageLevel = sampleStoragePercentage(vehicleCount, status[prevIndex]?.device_storage_level ?? 100)
        const batteryLevel = sampleBatteryPercentage(vehicleCount, status[prevIndex]?.device_battery_level ?? 100)

        const sensorStatus = (batteryLevel: number, storageLevel: number): TCDF_SENSOR_STATUS => {
            if (batteryLevel < 20 || storageLevel < 20) return 'error'
            return 'ok'
        }

        status.push({
            device_battery_level: batteryLevel,
            device_storage_level: storageLevel,
            device_sensor_status: sensorStatus(batteryLevel, storageLevel),
            status_capture_time: timestamp.toISOString()
        })

    }

    return {
        deviceTemplate: device,
        start: new Date(alignedStart),
        status
    }
}

function generateReadings24hrs(device: DeviceTemplate, start: Date): ReadingComposite {

    // Assume for at most SF7, overheadSize: 13, payload: 9; 530 messages (src: https://avbentem.github.io/airtime-calculator/ttn/us915/9) (145 )
    // TODO: Cap the number of uplinks to 145 - 24 (24 for hourly status messages)
    // TODO: Show that during increased periods of traffic, more readings are allowed to be generated

    // const alignedStart = new Date(start).setUTCHours(0, 0, 0, 0)
    const alignedStart = adjustWithTimezone(start, timezone)

    noticeMessage(
        "Reading Window",
        `Timezone: ${timezone} | Local midnight → UTC: ${new Date(alignedStart).toISOString()} | Window end: ${new Date(alignedStart + 24 * 60 * 60_000).toISOString()}`
    )

    const readings: Array<GeneratedReading> = []

    for (let minute = 0; minute < 24 * 60; minute++) {
        const bucket = new Date(alignedStart + minute * 60_000);
        const hour = getHourInTimezone(bucket, timezone)
        const intensity = sampleTrafficGaussianIntensity(hour);

        // VPM = Vehicles Per Minute
        // meanVpm = The base values of the gaussian curve - always consistent
        const meanVpm = 2 + (mean_vpm ?? 35) * intensity;
        // vehicleCount = Based upon the consistent meanVpm but with randomness introduced
        // Additionally, the Math.random() - 0.5 is arbitrarily selected but the * 2 part is for either side
        // of the deviation from the mean as a means of introducing noise.

        // The Math.max ensures we never get a negative value as it may dip below 0.
        // const vehicleCount = Math.max(0, Math.round(meanVpm + (Math.random() - 0.5) * 2));
        let vehicleCount = poisson(meanVpm)


        for (let count = 0; count < vehicleCount; count++) {

            // Provide Headway Time differences betweeen vehicles in a singe minute (1000 ms * 60 = 60000)
            const withinMs = Math.floor(Math.random() * 60_000);
            const timestamp = new Date(bucket.getTime() + withinMs)

            // TODO: Possibly introduce a bias here for morning and afternoon commutes in terms of directions
            const lane_weights = sampleLaneWeights(hour, device.peakDirections, device.type, device.directions)
            const vehicle_direction = sampleDirection(device.directions, device.type, lane_weights)

            // Lane Range must be computed to properly align vehicle lane sample to the correct direction.
            let laneRange: [number, number] | null = null;
            if (laneCount(device.type) === 4) {

                if (vehicle_direction === device.directions.road_primary_direction) laneRange = [1, 2]
                else laneRange = [3, 4]

            } else {

                if (vehicle_direction === device.directions.road_primary_direction) laneRange = [1, 1]
                else laneRange = [2, 2]

            }

            const vehicle_lane = sampleLane(
                laneRange[0],
                laneRange[1]
            )

            const vehicle_type = sampleVehicleType(intensity)

            const vehicle_speed = sampleSpeedMph(
                device.speedLimitMph,
                intensity,
                vehicle_type
            )

            readings.push({
                vehicle_detection_time: timestamp.toISOString(),
                vehicle_speed,
                vehicle_type,
                vehicle_direction,
                vehicle_lane,
                road_type: device.type,
                road_primary_direction: device.directions.road_primary_direction,
                road_secondary_direction: device.directions.road_secondary_direction,
            });

        }
    }

    return {
        deviceTemplate: device,
        readings,
        start: new Date(alignedStart)
    };
}

// Processing Functions
const createNibblePayload = (firstPayloadValue: number, secondPayloadValue: number) => {

    const firstPayload = (firstPayloadValue & (0x0F)) << 4;
    const secondPayload = secondPayloadValue & (0x0F);

    const combinedPayloadValue = firstPayload | secondPayload;
    return combinedPayloadValue;
}

function createReadingPayload(template: DeviceTemplate, reading: GeneratedReading) {

    const formatter = new TrafficCountingDeviceFormatter()

    const payloadBuffer = new ArrayBuffer(9)
    const payloadDataView = new DataView(payloadBuffer)

    const messageType = 0;
    payloadDataView.setUint8(0, messageType)

    const detectionTime = Math.floor(new Date(reading.vehicle_detection_time).getTime() / 1000)
    payloadDataView.setUint32(1, detectionTime)

    payloadDataView.setUint8(5, reading.vehicle_speed)

    const byteSixPayload = createNibblePayload(
        formatter.vehicleTypeValue(reading.vehicle_type),
        formatter.directionTypeValue(reading.vehicle_direction)
    );
    payloadDataView.setUint8(6, byteSixPayload)

    const byteSevenPayload = createNibblePayload(
        reading.vehicle_lane,
        formatter.roadTypeValue(reading.road_type)
    )
    payloadDataView.setUint8(7, byteSevenPayload)

    const byteEightPayload = createNibblePayload(
        formatter.roadDirectionValue(
            template.directions.road_primary_direction,
            template.directions.road_secondary_direction
        ),
        0
    )
    payloadDataView.setUint8(8, byteEightPayload)

    return btoa(String.fromCharCode(...new Uint8Array(payloadBuffer)));
}

function createStatusPayload(template: DeviceTemplate, status: GeneratedStatus) {
    const formatter = new TrafficCountingDeviceFormatter();

    const payloadBuffer = new ArrayBuffer(9)
    const payloadDataView = new DataView(payloadBuffer)

    const messageType = 1;
    payloadDataView.setUint8(0, messageType)

    payloadDataView.setUint8(1, status.device_battery_level)
    payloadDataView.setUint8(2, status.device_storage_level)

    const byteThreePayload = createNibblePayload(formatter.sensorStatusValue(status.device_sensor_status), 0)
    payloadDataView.setUint8(3, byteThreePayload)

    const captureTime = Math.floor(new Date(status.status_capture_time).getTime() / 1000)
    payloadDataView.setUint32(4, captureTime)

    return btoa(String.fromCharCode(...new Uint8Array(payloadBuffer)));
}

function createReadingUplink(template: DeviceTemplate, reading: GeneratedReading): tts_UplinkContract {

    const uplinkMessage = (): tts_UplinkContract => {
        return {
            uplink_message: {
                application_ids: {
                    application_id: tts_app_id
                },
                device_id: template.tts_device_id,
                frm_payload: createReadingPayload(template, reading)
            }
        }
    }

    return uplinkMessage()
}

function createStatusUplink(template: DeviceTemplate, gs: GeneratedStatus): tts_UplinkContract {

    const uplinkMessage = (): tts_UplinkContract => {
        return {
            uplink_message: {
                application_ids: {
                    application_id: tts_app_id
                },
                device_id: template.tts_device_id,
                frm_payload: createStatusPayload(
                    template,
                    gs
                )
            },
        }
    }
    return uplinkMessage()

}

async function sendUplink(uplink: tts_UplinkContract): Promise<DeviceData> {
    noticeMessage("Transmitting Uplink", uplink)
    return fetch(`${uplink_server_address}/uplink`, {
        method: 'POST',
        headers: {
            'x-webhook-key': session_webhook_key,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(uplink)
    }).then((response) => {
        if (!response.ok) throw new Error(`Failed to transmit uplink. ${response.statusText}`,)
        return response.json()
    }).then(({ data }: DeviceContract) => {
        noticeMessage("Device Provision Successful", uplink.uplink_message.device_id)
        return data
    }).catch((error) => {
        noticeMessage("Device Provision Unsuccessful", uplink.uplink_message.device_id)
        throw error
    })
}

async function requestClaimedSessionDevices(): Promise<Array<DeviceData>> {
    noticeMessage("Retrieving Devices")
    return fetch(`${uplink_server_address}/device/project/${validSession.project_id}`)
        .then((response) => {
            if (!response.ok) throw new Error("Error retriving session devices.")
            return response.json()
        }).then(({ data }: DevicesContract) => {
            return data;
        })
}

function formatUplinkEntry(template: DeviceTemplate, adjustedCreatedAt: Date, rawPayload: string, rawUplink: string, projectId: number): NewUplink {

    // timeAdjustmentMs is the number of seconds from the precomputed to a random adjustment.
    const timeAdjustmentMs = (Math.random() * 100 % 30) * 1000;

    // timeDelta is the number of seconds between creation and updated after processing. The mod operator is used to restrict the maxium number of seconds.
    const timeDeltaMs = (Math.random() * 100 % 20) * 1000;
    const createdTimestamp = new Date(new Date(adjustedCreatedAt).getTime() - timeAdjustmentMs);
    const updatedTimestamp = new Date(new Date(adjustedCreatedAt).getTime() - timeAdjustmentMs + timeDeltaMs);
    return {
        status: 'processed',
        raw_payload: rawPayload,
        raw_uplink: rawUplink,
        project_id: projectId,
        tts_device_id: template.tts_device_id,
        created_at: createdTimestamp.toISOString(),
        updated_at: updatedTimestamp.toISOString()
    }
}

function formatReadingEntry(template: DeviceTemplate, uplinkId: number, processedTime: Date, projectId: number, reading: GeneratedReading): NewReading {

    if (!template.dbDeviceId) {
        errorMessage("Device Template", template)
        throw new Error("Device Template is missing dbDeviceId.")
    }

    return {
        device_id: template.dbDeviceId,
        project_id: projectId,
        uplink_id: uplinkId,
        vehicle_speed: reading.vehicle_speed,
        vehicle_lane: reading.vehicle_lane,
        vehicle_type: reading.vehicle_type,
        road_type: reading.road_type,
        vehicle_direction: reading.vehicle_direction,
        road_primary_direction: reading.road_primary_direction,
        road_secondary_direction: reading.road_secondary_direction,
        vehicle_detection_time: new Date(reading.vehicle_detection_time).toISOString(),
        created_at: processedTime.toISOString()
    }
}

function formatStatusEntry(template: DeviceTemplate, uplinkId: number, processedTime: Date, projectId: number, status: GeneratedStatus): NewStatus {
    if (!template.dbDeviceId) {
        errorMessage("Device Template", template)
        throw new Error("Device Template is missing dbDeviceId.")
    }

    return {
        device_id: template.dbDeviceId,
        project_id: projectId,
        created_at: processedTime.toISOString(),
        uplink_id: uplinkId,
        device_battery_level: status.device_battery_level,
        device_storage_level: status.device_storage_level,
        device_sensor_status: status.device_sensor_status,
        status_capture_time: new Date(status.status_capture_time).toISOString(),
    }
}

// Verify Database Message
warnMessage("Verifying Uplink Database Connection...")
let database = null;
try {
    if (!connect_string) {
        errorMessage("Missing Connect String", "Connect string is required.")
        process.exit(0)
    }
    const config = parseIntoClientConfig(connect_string)
    const databaseClient = new PostgresDialect({
        pool: new Pool(config)
    })

    database = new Kysely<UplinkDatabase>({
        dialect: databaseClient
    })

    await sql`SELECT NOW()`.execute(database).then(() =>
        successMessage("Successfully Connected to Uplink Database"))
        .catch((error) => { throw error })
} catch (error) {
    errorMessage("Database Error", "Couldn't reach or connect to database.", error)
    process.exit()
}

// Verify Session Exists and Unclaimed
warnMessage("Verifying Session...")
let validSession = await fetch(`${session_server_address}/session/${session_id}`).then((response) => {
    if (!response.ok) throw new Error("Session doesn't exist.")
    return response.json()
}).then(({ data }: SessionContract) => {

    successMessage("Session Verified!", data)
    return data;
}).catch((error) => {
    errorMessage("Session Invalid", error)
    process.exit(0)
})

// Generating Composites
warnMessage("Generating Reading Composites")
const rawReadingComposites = deviceTemplates.map((d) => generateReadings24hrs(d, new Date(Date.now())))
rawReadingComposites.forEach(({ readings, deviceTemplate }) => {
    const readingsCount = readings.length
    successMessage("Generated Reading Composite", {
        readingsCount,
        deviceTemplate
    })
})

warnMessage("Generating Status Composites")
const rawStatusComposites = deviceTemplates.map((d) => generateStatus24hrs(d, new Date(Date.now())))
rawStatusComposites.forEach(({ status, deviceTemplate }) => {
    const statusCount = status.length;
    successMessage("Generated Satatus Composite", {
        statusCount,
        deviceTemplate
    })
})

if (provision) {
    noticeMessage("Provisioning Session", "Session will be provisioned with devices.")
    if (validSession.status === 'unclaimed') {

        warnMessage("Session Unclaimed", "Starting Session Claiming Process")
        await fetch(`${session_server_address}/provisioning/session_claim`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                session_id: validSession.session_id,
                tts_app_id: tts_app_id
            })
        })
            .then((response) => {
                if (!response.ok) throw response
                successMessage("Session Claimed")
            })
            .catch(async (error) => {
                errorMessage("Session Claim Unsuccessful", JSON.stringify(await error.json()))
                process.exit(0)
            })

        warnMessage("Provisioning Devices")
        const simulatedUplinks = rawReadingComposites.reduce<tts_UplinkContract[]>(
            (curr, composite) => {
                const reading = composite.readings.shift();
                if (reading) curr.push(createReadingUplink(composite.deviceTemplate, reading));
                return curr;
            },
            []
        );

        await Promise.all(
            simulatedUplinks.map(async (uplink) => await sendUplink(uplink)
            )).then(() => successMessage("Successfully Provisioned Session"))

    } else {
        warnMessage("Session Claimed", "Checking number of device templates match session's devices.")
        const devices = await requestClaimedSessionDevices().catch((error) => {
            errorMessage("Failed Retriving Devices", error)
            process.exit(0)
        })
        noticeMessage("Session Device Count", `Seeing ${devices.length} devices in the session.`, devices)

        if (devices.length === 0) {

            warnMessage("No Devices Found", "Device were not found for claimed session. Attempting provisioning.")
            const simulatedUplinks = rawReadingComposites.reduce<tts_UplinkContract[]>(
                (curr, composite) => {
                    const reading = composite.readings.shift();
                    if (reading) curr.push(createReadingUplink(composite.deviceTemplate, reading));
                    return curr;
                },
                []
            );

            await Promise.all(simulatedUplinks.map((uplink) => sendUplink(uplink)))
        } else if (devices.length !== deviceTemplates.length) {
            warnMessage("Device Mismatch", "Number of device templates and found devices do not match. Reconciling...")

            const ttsDeviceIdsPresent = devices.map((device) => device.tts_device_id)
            const missingDeviceComposites = rawReadingComposites.filter((composite) => !ttsDeviceIdsPresent.includes(composite.deviceTemplate.tts_device_id))

            const reconciledUplinks = missingDeviceComposites.reduce<tts_UplinkContract[]>(
                (curr, composite) => {
                    const reading = composite.readings.shift();
                    if (reading) curr.push(createReadingUplink(composite.deviceTemplate, reading));
                    return curr;
                },
                []
            );

            await Promise.all(reconciledUplinks.map((uplink) => sendUplink(uplink)))
            process.exit(0)
        } else {
            successMessage("Skipping Provisioning", "Device count match successful.")
        }
    }

    successMessage("Session Provisioned!")
    noticeMessage("Exiting Now", "Remove the provision flag to generate data.")
    process.exit(0)
}

noticeMessage("Mapping Session Devices to Device Templates")
deviceTemplates = await requestClaimedSessionDevices()
    .then((devices) => {
        if (devices.length === 0) {
            noticeMessage("Session Devices Empty", "Ensure session has been provisioned.")
            throw new Error("Session does not any devices.")
        }
        return devices;
    })
    .then((devices) =>
        deviceTemplates.map((template) => {
            const foundDevice = devices.find(
                (device) => device.tts_device_id === template.tts_device_id
            )

            if (foundDevice) {
                const mappedTemplate: DeviceTemplate = {
                    ...template,
                    dbDeviceId: foundDevice.device_id
                }
                successMessage("Mapped Device Template", mappedTemplate)
                return mappedTemplate
            }
            else {
                throw new Error(`Failed Device Template Mapping: Failed mapping device template ${template.tts_device_id}`)
            }
        })
    ).catch((error) => {
        errorMessage("Device Template Mapping Failure", error)
        process.exit(0)
    })

// Preparing for Data Injestion - Need Project Id
noticeMessage("Retriving Claimed Session")
validSession = await fetch(`${session_server_address}/session/${session_id}`).then((response) => {
    if (!response.ok) throw new Error("Session doesn't exist.")
    return response.json()
}).then(({ data }: SessionContract) => {

    successMessage("Retrived Claimed Session", data)
    return data;
}).catch((error) => {
    errorMessage("Session Invalid", error)
    process.exit(0)
})

// Source: https://stackoverflow.com/questions/8495687/split-array-into-chunks
function chunk<DataType>(items: Array<DataType>, chunkSize: number) {
    return items.reduce<Array<Array<DataType>>>((chunkArray, item, index) => {
        const chunkIndex = Math.floor(index / chunkSize)

        if (!chunkArray[chunkIndex]) {
            chunkArray[chunkIndex] = [] // start a new chunk
        }

        chunkArray[chunkIndex].push(item)

        return chunkArray
    }, [])
}

const CHUNK_SIZE = 100;

const updatedReadingComposites: Array<ReadingComposite> = rawReadingComposites.map((composite) => {

    const dbDeviceId = deviceTemplates.find((template) => template.tts_device_id === composite.deviceTemplate.tts_device_id)?.dbDeviceId

    if (!dbDeviceId) {
        errorMessage("Reading Composite Update Failure", "Can't update the composite correctly.")
        process.exit(0)
    }

    return {
        ...composite,
        deviceTemplate: {
            ...composite.deviceTemplate,
            dbDeviceId
        }
    }
})

const updtaedStatusComposites: Array<StatusComposite> = rawStatusComposites.map((composite) => {

    const dbDeviceId = deviceTemplates.find((template) => template.tts_device_id === composite.deviceTemplate.tts_device_id)?.dbDeviceId

    if (!dbDeviceId) {
        errorMessage("Status Composite Update Failure", "Can't update the composite correctly.")
        process.exit(0)
    }

    return {
        ...composite,
        deviceTemplate: {
            ...composite.deviceTemplate,
            dbDeviceId
        }
    }

})

await database.transaction().execute(async (trx) => {

    const readingEntryComposites = updatedReadingComposites.map((composite): EntryComposite<GeneratedReading, Reading> => ({
        mappedTemplate: composite.deviceTemplate,
        data: composite.readings,
        inserted: {
            uplinks: [],
            data: []
        }
    }))

    // Reading Composites
    for (let composite of readingEntryComposites) {
        // Step 0a: Format the reading uplinks,
        // Step 1a: Chunk the reading uplinks,
        // Step 2a: Insert the chunk reading uplinks,
        // Step 3a: Get the resulting array of the reading uplinks
        // Step 4a: Flatten the chunked resulting array of reading uplinks 
        // Step 5a: update the composite reading uplinks
        const readingUplinks: Array<NewUplink> = composite.data.map((gr) => formatUplinkEntry(
            composite.mappedTemplate,
            new Date(gr.vehicle_detection_time),
            createReadingPayload(composite.mappedTemplate, gr),
            JSON.stringify(createReadingUplink(composite.mappedTemplate, gr)),
            validSession.project_id,
        ))
        const chunkedReadingUplinks = chunk(readingUplinks, CHUNK_SIZE)

        const insertedUplinks = await Promise.all(
            chunkedReadingUplinks.map((chunk, idx) => {
                noticeMessage(
                    "Inserting uplink (reading)",
                    composite.mappedTemplate.tts_device_id,
                    `chunk ${idx + 1}/${chunk.length}`,
                    "rows:", chunk.length
                );

                return trx.insertInto('uplink').values(chunk).returningAll().execute()

            })
        )

        composite.inserted.uplinks = insertedUplinks.flat()

        const insertedReadingEntries = await Promise.all(
            insertedUplinks.map((chunk, chunkIdx) => {

                const newReadingInserts = chunk.map((uplink, itemIdx) => {

                    const mappedReading = composite.data[CHUNK_SIZE * chunkIdx + itemIdx]

                    noticeMessage(
                        "Inserting reading",
                        composite.mappedTemplate.tts_device_id,
                        `chunk ${chunkIdx + 1}/${chunk.length}`,
                        "rows:", chunk.length
                    );

                    if (!mappedReading) throw new Error("Error mapping from Uplink Entry to Reading Entry")

                    return formatReadingEntry(
                        composite.mappedTemplate,
                        uplink.uplink_id,
                        new Date(uplink.updated_at),
                        validSession.project_id,
                        mappedReading
                    )
                })
                console.log("Top Timestmap -Reading", newReadingInserts[0]?.vehicle_detection_time)
                return trx.insertInto('reading').values(newReadingInserts).returningAll().execute()
            })

        )

        composite.inserted.data = insertedReadingEntries.flat(1);
    }

    const statusComposites = updtaedStatusComposites.map((composite): EntryComposite<GeneratedStatus, Status> => ({
        mappedTemplate: composite.deviceTemplate,
        data: composite.status,
        inserted: {
            uplinks: [],
            data: []
        }
    }))

    // Status Composite
    for (let composite of statusComposites) {
        const statusUplinks = composite.data.map((gs: GeneratedStatus) => formatUplinkEntry(
            composite.mappedTemplate,
            new Date(gs.status_capture_time),
            createStatusPayload(composite.mappedTemplate, gs),
            JSON.stringify(createStatusUplink(composite.mappedTemplate, gs)),
            validSession.project_id
        ))

        const chunkedStatusUplinks = chunk(statusUplinks, CHUNK_SIZE)

        const insertedStatusUplinks = await Promise.all(
            chunkedStatusUplinks.map((chunk, chunkIdx) => {

                noticeMessage(
                    "Inserting uplink (status)",
                    composite.mappedTemplate.tts_device_id,
                    `chunk ${chunkIdx + 1}/${chunk.length}`,
                    "rows:", chunk.length
                );

                return trx.insertInto('uplink').values(chunk).returningAll().execute()
            })
        )

        composite.inserted.uplinks = insertedStatusUplinks.flat(1)

        const insertedStatusEntries = await Promise.all(
            insertedStatusUplinks.map((chunk, chunkIdx) => {

                const newStatusInserts = chunk.map((uplink, itemIdx) => {

                    const mappedStatus = composite.data[CHUNK_SIZE * chunkIdx + itemIdx]

                    if (!mappedStatus) throw new Error("Error mapping from Uplink Entry to Status Entry")

                    return formatStatusEntry(
                        composite.mappedTemplate,
                        uplink.uplink_id,
                        new Date(uplink.updated_at),
                        validSession.project_id,
                        mappedStatus
                    )
                })

                noticeMessage(
                    "Inserting status",
                    composite.mappedTemplate.tts_device_id,
                    `chunk ${chunkIdx + 1}/${chunk.length}`,
                    "rows:", chunk.length
                );

                return trx.insertInto('status').values(newStatusInserts).returningAll().execute()

            })
        )

        composite.inserted.data = insertedStatusEntries.flat(1)
    }

    return trx
})

database.destroy()
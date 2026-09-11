CREATE TYPE UPLINK_STATUS AS ENUM ('unprocessed', 'processed', 'failed');

CREATE TABLE uplink (
    uplink_id SERIAL PRIMARY KEY,
    raw_uplink JSON NOT NULL,
    raw_payload VARCHAR NOT NULL,
    project_id INT NOT NULL,
    tts_device_id VARCHAR NOT NULL,
    status UPLINK_STATUS,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

CREATE TABLE device (
    device_id SERIAL PRIMARY KEY,
    tts_device_id VARCHAR NOT NULL,
    is_pinned BOOLEAN NOT NULL,
    is_hidden BOOLEAN NOT NULL,
    label VARCHAR,
    description TEXT,
    project_id INT NOT NULL,
    origin_uplink_id INT NOT NULL REFERENCES uplink(uplink_id),
    config_reading_id INT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    UNIQUE (project_id, tts_device_id)
);

CREATE TABLE status (
    status_id SERIAL PRIMARY KEY,
    device_id INT NOT NULL REFERENCES device(device_id),
    project_id INT NOT NULL,
    uplink_id INT NOT NULL UNIQUE REFERENCES uplink(uplink_id),
    device_battery_level INT NOT NULL,
    device_storage_level INT NOT NULL,
    device_sensor_status VARCHAR NOT NULL,
    status_capture_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE reading (
    reading_id SERIAL PRIMARY KEY,
    device_id INT NOT NULL REFERENCES device(device_id),
    project_id INT NOT NULL,
    uplink_id INT NOT NULL UNIQUE REFERENCES uplink(uplink_id),
    vehicle_detection_time TIMESTAMP NOT NULL,
    vehicle_speed INT NOT NULL,
    vehicle_type VARCHAR NOT NULL,
    vehicle_direction VARCHAR NOT NULL,
    vehicle_lane VARCHAR NOT NULL,
    road_type VARCHAR NOT NULL,
    road_primary_direction VARCHAR NOT NULL,
    road_secondary_direction VARCHAR NOT NULL,
    created_at TIMESTAMP NOT NULL
);

ALTER TABLE device
ADD CONSTRAINT fk_device_config_reading
FOREIGN KEY (config_reading_id)
REFERENCES reading(reading_id);
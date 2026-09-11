/* Three tables for this microservice: WebhookKey, Session, Project */
/* ALTER SEQUENCE test_table_rec_id_seq RESTART WITH 4615793; */

CREATE TYPE SESSION_VISIBILITY_STATUS AS ENUM ('public', 'private');
CREATE TYPE SESSION_CLAIM_STATUS AS ENUM ('claimed', 'unclaimed', 'expired');

CREATE TABLE session (
    session_id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    status SESSION_CLAIM_STATUS,
    project_id INT UNIQUE,
    tts_app_id VARCHAR,
    visibility SESSION_VISIBILITY_STATUS,
    password VARCHAR,
    salt VARCHAR,
    administrative_password VARCHAR,
    administrative_salt VARCHAR,
    is_deleted BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    active_at TIMESTAMP
);

CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,
    session_id INT UNIQUE NOT NULL REFERENCES session(session_id),
    tts_app_id VARCHAR NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE webhook_key (
    webhook_key_id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES session(session_id),
    hashed_key VARCHAR NOT NULL UNIQUE,
    is_revoked BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

ALTER SEQUENCE session_session_id_seq RESTART WITH 4322;

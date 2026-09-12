# Road Citizen Inspector

<p align="center">
  <img src="media/logo.png" alt="Road Citizen Inspector logo" width="200">
</p>

Road Citizen Inspector (RCI) is a software platform developed as part of the master's thesis **"Citizen Infrastructure for Traffic Monitoring Using LoRaWAN Technology"** at the University of Nevada, Reno in May 2026.

The thesis is available through ProQuest and can be accessed using the [University of Nevada, Reno ProQuest Dissertations and Theses](https://guides.library.unr.edu/pqdt-unr) library. It provides a detailed description of the system architecture and microservice design. A high-level overview of the software architecture is shown below.

<p align="center">
  <img src="media/overview.png" alt="Road Citizen Inspector software architecture" width="500">
</p>

## Deploying for Evaluation

Use the following instructions to run the application locally for evaluation.

### Prerequisites

- Docker with Docker Compose
- Node.js
- pnpm

### Start the Backend

From the repository root, start the backend services with Docker Compose:

```bash
docker compose up --build
```

### Start the Frontend

In a separate terminal, install the frontend dependencies and start the development server:

```bash
cd apps/rci_frontend
pnpm install
pnpm build
pnpm dev
```

Follow the local URL displayed by Vite to open the application.

### Stop the Application

Stop the frontend development server with <kbd>Ctrl</kbd> + <kbd>C</kbd>. From the repository root, stop and remove the backend containers with:

```bash
docker compose down
```

## Deploying Locally with The Things Stack

Use the following instructions to deploy the platform locally for integration with The Things Stack.

### Prerequisites

Before starting the deployment:

1. Obtain HTTPS certificates for the domains that will be used by NGINX.
2. Provide the certificate directory to `production.docker-compose.yml` through the required environment variables. The included `.env.blk` file can be copied and used as the starting point for a `.env` file.
3. Update `nginx/production.nginx.conf` with the domains associated with the HTTPS certificates.

### Configure the Environment

From the repository root, create the environment file:

```bash
cp .env.blk .env
```

Open `.env` and provide the required certificate directory and other deployment-specific values.

> [!IMPORTANT]
> Do not commit `.env`, private keys, certificates, passwords, or other secrets to version control.

### Configure NGINX

Open `nginx/production.nginx.conf` and replace the placeholder domains with the domains configured for the deployment (Line 29 and Line 41).

### Start the Application

From the repository root, build and start the production services:

```bash
docker compose -f production.docker-compose.yml up --build
```

To run the services in the background, include the `-d` option:

```bash
docker compose -f production.docker-compose.yml up --build -d
```

### Stop the Application

From the repository root, stop and remove the production containers with:

```bash
docker compose -f production.docker-compose.yml down
```

## Generating Mock Data

The repository includes a seeding script that can populate the application databases with mock traffic readings and device-status data for evaluation. The script provides several CLI options for targeting a deployment, configuring simulated traffic data, and controlling seed values. Device templates used to generate sensor data can be configured within `seed.ts`.

Run the seeding script only after the backend services and their databases are running.

> [!WARNING]
> When deploying with The Things Stack, the following services must be uncommented in `production.docker-compose.yml` for the seeding script to operate: `us_uplink_api` and `us_session_api`.

### Seeding Options

- `session (-s)`: The ID of the Traffic Monitoring session to target.
- `key (-k)`: The generated webhook key that allows The Things Stack to publish uplinks to a Traffic Monitoring session.
- `tts_app_id (-a)`: The Things Stack application ID assigned to a session upon receipt of its first uplink. This value may be any application ID selected by the user when initially seeding the session.
- `connect_string (-cs)`: The connection string for the Uplink microservice database.
- `mean_vpm (-vpm)`: The average number of vehicles detected per minute along a corridor within a transportation network.
- `uplink_server_address (-u_addr)`: The address of the Uplink API server.
- `session_server_address (-s_addr)`: The address of the Session API server.
- `provision (-p)`: Provisions devices using the device templates defined in `seed.ts`. **Devices must be provisioned before traffic or status data can be seeded.**
- `timezone (-tz)`: The timezone of the simulated vehicle-detection timestamps. These timestamps are converted from the specified timezone to UTC before being stored in the database.

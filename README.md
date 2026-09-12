# road-citizen-inspector-public
<p align="center">
    <img src="media/logo.png" style="width: 200px;">
</p>

The Road Citizen Inspector is software platform built as part of the Master's thesis titled **"Citizen Infrastructure for Traffic Monitoring Using LoRaWAN Technology"** at the University of Nevada, Reno in May 2026. It is available on ProQuest and is accessible [here](https://guides.library.unr.edu/pqdt-unr). The system architecture and design of the microservices are better described within the thesis. For quick reference, an overview of the software architecture is shown below.

<p align="center">
    <img src="media/overview.png" style="width: 500px;">
</p>

## Deploying for Evaluation
If you like to deploy for quick evaluation you may use the following steps below to use the application.
```
// Beginning from repository directory.

// Build the backend services using Docker Compose.
cd ./road-citizen-inspector
docker compose up --build

// Startup the frontend to use with the backend services.
cd ./apps/rci_frontend
pnpm run -r build
pnpm install
pnpm run dev
```

## Deploying Locally
If you like to deploy for usage with the ThingsStack, you may use the following steps below to use the application. There are some pre-requisites for the deployment of the software platform.
```

```

## Generating Mock Data
If you like to generate mock data and seed the application's databases you may use the following steps below to use a seeding script.

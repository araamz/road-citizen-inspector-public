FROM public.ecr.aws/docker/library/node:lts-alpine3.22
WORKDIR /app
RUN npm install -g pnpm

EXPOSE 4001

# copy minimal manifests for better cache
COPY pnpm-lock.yaml .
COPY package.json .
COPY pnpm-workspace.yaml .
COPY ./packages/ ./packages/
COPY ./services/session/api ./services/session/api
RUN pnpm install
RUN pnpm -r run build

# install only the service and its local workspace deps
RUN pnpm -r i --filter ./services/session/api --filter @road-citizen-inspector/schemas
RUN pnpm -r i --filter ./services/session/api --filter @road-citizen-inspector/password-strategy
RUN pnpm -r i --filter ./services/session/api --filter @road-citizen-inspector/models
RUN pnpm -r i --filter ./services/session/api --filter @road-citizen-inspector/contracts
RUN pnpm -r i --filter ./services/session/api --filter @road-citizen-inspector/session-expiry-jobs
RUN pnpm -r i --filter ./services/session/api --filter @road-citizen-inspector/server-map
RUN pnpm -C ./services/session/api install
CMD pnpm -C ./services/session/api dev

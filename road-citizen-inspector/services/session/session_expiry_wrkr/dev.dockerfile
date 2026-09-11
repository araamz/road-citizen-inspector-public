FROM public.ecr.aws/docker/library/node:lts-alpine3.22
WORKDIR /app
RUN npm install -g pnpm

# copy minimal manifests for better cache
COPY pnpm-lock.yaml .
COPY package.json .
COPY pnpm-workspace.yaml .
COPY ./packages/ ./packages/
COPY ./services/session/session_expiry_wrkr ./services/session/session_expiry_wrkr
RUN pnpm install
RUN pnpm -r run build

# install only the service and its local workspace deps
RUN pnpm -r i --filter ./services/session/session_expiry_wrkr --filter @road-citizen-inspector/schemas
RUN pnpm -r i --filter ./services/session/session_expiry_wrkr --filter @road-citizen-inspector/password-strategy
RUN pnpm -r i --filter ./services/session/session_expiry_wrkr --filter @road-citizen-inspector/models
RUN pnpm -r i --filter ./services/session/session_expiry_wrkr --filter @road-citizen-inspector/contracts
RUN pnpm -r i --filter ./services/session/session_expiry_wrkr --filter @road-citizen-inspector/session-expiry-jobs
RUN pnpm -C ./services/session/session_expiry_wrkr install
CMD pnpm -C ./services/session/session_expiry_wrkr dev

FROM amazon/aws-lambda-nodejs:20 AS base

FROM base AS builder

WORKDIR /app

COPY package*json tsconfig.json handler/* ./

RUN npm ci && npm run build

FROM base AS runner
WORKDIR /app

COPY --from=builder  /app/dist ${LAMBDA_TASK_ROOT}
COPY --from=builder  /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY --from=builder  /app/package.json ${LAMBDA_TASK_ROOT}/package.json
COPY --from=builder  /app/init.sql ${LAMBDA_TASK_ROOT}/init.sql

CMD ["/app/dist/index.handler"]


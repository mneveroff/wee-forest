# syntax=docker/dockerfile:1

FROM node:24 AS builder

WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY lens/package.json ./lens/
COPY site/package.json ./site/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

COPY lens/ ./lens/
COPY site/ ./site/

ENV ASTRO_TELEMETRY_DISABLED=1
RUN pnpm build:site
RUN pnpm --filter wee-forest-lens exec node build.js

FROM node:24

LABEL maintainer="Mike Neverov <mike@neveroff.dev>"
LABEL version="1.0"
LABEL description="WeeForest site and Lens map application"
LABEL repository="https://github.com/MNeverOff/wee-forest"

WORKDIR /repo

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY lens/package.json ./lens/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
  pnpm install --filter wee-forest-lens --prod --frozen-lockfile

COPY --from=builder /repo/lens/public/ ./lens/public/
COPY --from=builder /repo/lens/public/dist/ ./lens/public/dist/
COPY --from=builder /repo/site/dist/ ./site/dist/
COPY lens/src/server.mjs ./lens/src/
COPY lens/src/posthog.mjs ./lens/src/
COPY lens/src/runtime-config.mjs ./lens/src/
COPY lens/tileserver-config.prod.json ./lens/tileserver-config.json

WORKDIR /repo/lens

RUN mkdir -p /repo/lens/data/area /repo/lens/data/tiles && chmod -R a+w /repo/lens/data

ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH:-dev}
ENV SITE_DIST_PATH=/repo/site/dist

EXPOSE 3939

CMD ["node", "src/server.mjs"]

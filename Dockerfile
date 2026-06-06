FROM node:24

# Metadata
LABEL maintainer="Mike Neverov <mike@neveroff.dev>"
LABEL version="1.0"
LABEL description="Mapping trees of the United Kingdom"
LABEL repository="https://github.com/MNeverOff/wee-forest-lens"

WORKDIR /app

# Copying the core files
COPY lens/public/ /app/public/
COPY lens/public/dist/ /app/public/dist/
COPY lens/src/server.mjs /app/
COPY lens/src/posthog.mjs /app/
COPY lens/tileserver-config.prod.json /app/tileserver-config.json

# Creating the data directories and assigning permissions
RUN mkdir -p /app/data && chmod -R a+w /app/data
RUN mkdir -p /app/data/area && chmod -R a+w /app/data/area
RUN mkdir -p /app/data/tiles && chmod -R a+w /app/data/tiles

# Install dependencies
COPY lens/package.json /app/
RUN npm install --production

# Doesn't work yet
ARG GIT_HASH
ENV GIT_HASH=${GIT_HASH:-dev}

# Configure exposed port
EXPOSE 3939

# Run start.sh when the container launches
CMD ["npm", "run", "docker:serve"]
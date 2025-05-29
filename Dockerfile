# Use a Bun base image
FROM oven/bun:1.2.7 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lock
COPY package*.json bun.lock vite.config.ts proxy.ts ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Declare build arguments
ARG VITE_REGISTRY_URL
ARG VITE_BETTERFROST_URL
ARG VITE_OGMIOS_URL

# Set them as environment variables
ENV VITE_REGISTRY_URL=${VITE_REGISTRY_URL}
ENV VITE_BETTERFROST_URL=${VITE_BETTERFROST_URL}
ENV VITE_OGMIOS_URL=${VITE_OGMIOS_URL}

RUN bun run build

FROM oven/bun:slim

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/proxy.ts /app/proxy.ts

CMD ["bun", "run", "proxy.ts"]



# Use a Bun base image
FROM oven/bun:1.2.5

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lock
COPY package*.json bun.lock vite.config.ts ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

RUN bun run build

# Start the development server
CMD ["bun", "run", "proxy.ts"]

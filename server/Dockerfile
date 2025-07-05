# server/Dockerfile

FROM node:22-slim

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci

# Copy rest of the backend code
COPY . .

# Port used by Express
# Suggested port
EXPOSE 5050

# Start the backend
CMD ["npm", "run", "dev"]

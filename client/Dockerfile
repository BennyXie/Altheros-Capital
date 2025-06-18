# client/Dockerfile

FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Port used by frontend dev server (e.g. React/Vite)
EXPOSE 3000

CMD ["node", "run", "dev"]

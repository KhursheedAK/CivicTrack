# civic-backend — NestJS + ts-node (ts-node is needed for the seed script)
FROM node:20-slim

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npm run build

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production \
    PORT=3001

EXPOSE 3001
ENTRYPOINT ["/entrypoint.sh"]

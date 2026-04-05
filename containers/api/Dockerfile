# Build stage
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY api/package*.json ./
RUN npm install
COPY api/ .
RUN npm run build

# Production stage
FROM node:24-alpine AS production-stage
WORKDIR /app
COPY api/package*.json ./
RUN npm install --only=production
COPY --from=build-stage /app/dist ./dist

ENV PORT=3000
EXPOSE ${PORT}
CMD ["node", "dist/main"]
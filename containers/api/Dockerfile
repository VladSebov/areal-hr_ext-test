
# Build Stage
FROM node:22-alpine AS build-stage
WORKDIR /app

COPY api/package*.json ./api/
RUN cd api && npm ci

COPY docs/package*.json ./docs/
RUN cd docs && npm ci

COPY api/ ./api/
COPY docs/ ./docs/

RUN cd docs && npm run docs:build

RUN cd api && npm run build

# Production Stage
FROM node:22-alpine AS production-stage
WORKDIR /app

COPY api/package*.json ./
RUN npm ci --only=production

COPY --from=build-stage /app/api/dist ./dist

COPY --from=build-stage /app/docs/.vitepress/dist ./docs/.vitepress/dist

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "dist/main"]
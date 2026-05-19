# Build Stage
FROM node:22-alpine AS build-stage
WORKDIR /app

RUN npm install -g @quasar/cli
COPY app/package*.json ./
RUN npm ci

COPY app/ .
RUN quasar build -m spa

# Production Stage
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

ENV PORT=80
EXPOSE ${PORT}
CMD ["nginx", "-g", "daemon off;"]
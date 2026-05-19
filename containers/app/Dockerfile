
# Build Stage
FROM node:22-alpine AS build-stage
WORKDIR /app

RUN npm install -g @quasar/cli
COPY app/package*.json ./
RUN npm ci --ignore-scripts

COPY app/ .
RUN quasar prepare
RUN quasar build -m spa

# Production Stage
FROM nginx:stable-alpine AS production-stage

COPY --from=build-stage /app/dist/spa /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
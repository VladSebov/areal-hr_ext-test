# build stage
FROM node:22-alpine as build-stage
WORKDIR /app
COPY app/ .
RUN npm install
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
ENV PORT=80

EXPOSE ${PORT}
CMD ["nginx", "-g", "daemon off;"]


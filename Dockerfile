# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS lock
WORKDIR /tmp

COPY package.json bun.lock /tmp/
RUN bun install --frozen-lockfile -y

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=lock /tmp/yarn.lock /tmp/package.json ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

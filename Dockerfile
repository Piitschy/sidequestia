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
ENV VITE_API_URL=https://pb.sidequestia.de
ENV VITE_VAPID_PUBLIC_KEY=BL0s7N52dN74SZRnVAjxMZNTs-zTYQxBUUeqD4BqCkp2vN9TbULi_gEbjh4Nbr8gex_4zQiTz83ZSsOI2__RNE8
RUN yarn build

FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
COPY nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

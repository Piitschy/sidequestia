FROM golang:1.24-alpine AS build

WORKDIR /app 

COPY go.mod go.sum .
RUN go mod download
COPY . .
RUN go build -o ./pocketbase ./main.go

FROM alpine:latest AS production
COPY ./pb_migrations /pb/pb_migrations
COPY ./pb_hooks /pb/pb_hooks
COPY ./pb_public/ /pb/pb_public
COPY --from=build /app/pocketbase /pb/pocketbase

EXPOSE 8080

# start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]

# ===== build stage ====
FROM golang:1.22.10-bullseye as builder

WORKDIR /app

RUN go env -w GOCACHE=/go-cache
RUN go env -w GOMODCACHE=/gomod-cache

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/gomod-cache \
    go mod download

COPY . .

RUN --mount=type=cache,target=/gomod-cache \
    --mount=type=cache,target=/go-cache \
    go build -trimpath -ldflags="-w -s" -o bin/main main.go

# ===== deploy stage ====
FROM golang:1.22.10-bullseye as deploy

WORKDIR /app

RUN apt update -y

COPY --from=builder /app/bin/main .

CMD ["/app/main"]

# ===== dev ====
FROM golang:1.22.10-bullseye as dev

WORKDIR /app

RUN go install github.com/cosmtrek/air@v1.52.0
CMD ["air"]


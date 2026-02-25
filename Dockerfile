# syntax=docker/dockerfile:1.7

FROM rust:1.90-bookworm AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./

RUN mkdir -p src && echo "fn main() {}" > src/main.rs
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	--mount=type=cache,target=/app/target \
	cargo build --release

COPY src ./src
RUN --mount=type=cache,target=/usr/local/cargo/registry \
	cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/swarm /usr/local/bin/swarm

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["swarm"]

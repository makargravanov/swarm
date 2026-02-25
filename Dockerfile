FROM rust:1.85-bookworm AS builder
WORKDIR /app

COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/swarm /usr/local/bin/swarm

ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

CMD ["swarm"]

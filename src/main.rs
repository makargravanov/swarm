mod app_state;
mod auth;
mod config;
mod db;
mod error;
mod http;
mod models;

use app_state::AppState;
use auth::jwt::JwtService;
use config::AppConfig;
use sqlx::postgres::PgPoolOptions;
use tracing::{info, warn};
use tracing_subscriber::{fmt, EnvFilter};

#[tokio::main]
async fn main() {
    fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .init();

    let config = AppConfig::load();

    if config.jwt_secret_is_ephemeral {
        warn!(
            "JWT_SECRET is not set; generated ephemeral secret for this process. All JWT tokens will become invalid after restart"
        );
    }

    let db_pool = PgPoolOptions::new()
        .max_connections(12)
        .connect(&config.database_url)
        .await
        .expect("failed to connect to PostgreSQL (fail-fast startup)");

    db::schema::ensure_schema(&db_pool)
        .await
        .expect("database schema validation/creation failed (fail-fast startup)");

    let jwt_service = JwtService::new(config.jwt_secret.clone(), config.jwt_ttl_seconds);

    let app_state = AppState {
        db: db_pool,
        jwt: jwt_service,
    };

    let listener = tokio::net::TcpListener::bind(config.addr)
        .await
        .expect("failed to bind TCP listener");

    info!("server listening on http://{}", config.addr);

    axum::serve(listener, http::router(app_state))
        .await
        .expect("server failed");
}

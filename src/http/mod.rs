pub mod admin;
pub mod auth;
pub mod health;

use axum::{routing::get, Router};
use axum::routing::post;

use crate::app_state::AppState;

pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health::health))
        .route("/auth/register", post(auth::register))
        .route("/auth/login", post(auth::login))
        .route("/auth/me", get(auth::me))
        .route("/admin/ping", get(admin::ping))
        .with_state(state)
}

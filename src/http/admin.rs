use axum::{extract::State, Json};
use serde::Serialize;

use crate::{app_state::AppState, auth::extractor::AdminUser};

#[derive(Serialize)]
pub struct AdminPingResponse {
    status: &'static str,
    admin_id: String,
    nickname: String,
    email: String,
}

pub async fn ping(
    AdminUser(admin): AdminUser,
    State(_state): State<AppState>,
) -> Json<AdminPingResponse> {
    Json(AdminPingResponse {
        status: "ok",
        admin_id: admin.id.to_string(),
        nickname: admin.nickname,
        email: admin.email,
    })
}

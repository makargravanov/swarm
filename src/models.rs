use crate::db::users::UserRecord;
use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

#[derive(Debug, Serialize)]
pub struct PublicUser {
    pub id: Uuid,
    pub nickname: String,
    pub email: String,
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,
}

impl From<UserRecord> for PublicUser {
    fn from(value: UserRecord) -> Self {
        Self {
            id: value.id,
            nickname: value.nickname,
            email: value.email,
            is_admin: value.is_admin,
            created_at: value.created_at,
        }
    }
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: PublicUser,
}

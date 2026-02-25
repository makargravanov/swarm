use crate::error::AppError;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct UserRecord {
    pub id: Uuid,
    pub nickname: String,
    pub email: String,
    pub password_hash: String,
    pub is_admin: bool,
    pub created_at: DateTime<Utc>,
}

pub struct NewUser {
    pub nickname: String,
    pub email: String,
    pub password_hash: String,
    pub is_admin: bool,
}

pub async fn create_user(pool: &PgPool, new_user: NewUser) -> Result<UserRecord, AppError> {
    let user_id = Uuid::new_v4();

    let query_result = sqlx::query_as::<_, UserRecord>(
        r#"
        INSERT INTO users (id, nickname, email, password_hash, is_admin)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nickname, email, password_hash, is_admin, created_at
        "#,
    )
    .bind(user_id)
    .bind(new_user.nickname)
    .bind(new_user.email)
    .bind(new_user.password_hash)
    .bind(new_user.is_admin)
    .fetch_one(pool)
    .await;

    match query_result {
        Ok(record) => Ok(record),
        Err(sqlx::Error::Database(db_error)) if db_error.code().as_deref() == Some("23505") => {
            Err(AppError::Conflict(
                "user with this nickname or email already exists".to_string(),
            ))
        }
        Err(other) => Err(AppError::from(other)),
    }
}

pub async fn find_user_by_email(pool: &PgPool, email: &str) -> Result<Option<UserRecord>, AppError> {
    let record = sqlx::query_as::<_, UserRecord>(
        r#"
        SELECT id, nickname, email, password_hash, is_admin, created_at
        FROM users
        WHERE email = $1
        "#,
    )
    .bind(email)
    .fetch_optional(pool)
    .await?;

    Ok(record)
}

pub async fn find_user_by_id(pool: &PgPool, user_id: Uuid) -> Result<Option<UserRecord>, AppError> {
    let record = sqlx::query_as::<_, UserRecord>(
        r#"
        SELECT id, nickname, email, password_hash, is_admin, created_at
        FROM users
        WHERE id = $1
        "#,
    )
    .bind(user_id)
    .fetch_optional(pool)
    .await?;

    Ok(record)
}

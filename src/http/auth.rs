use axum::{extract::State, Json};
use bcrypt::{hash, verify, DEFAULT_COST};
use serde::Deserialize;

use crate::{
    app_state::AppState,
    auth::extractor::AuthUser,
    db::users::{self, NewUser},
    error::AppError,
    models::{AuthResponse, PublicUser},
};

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub nickname: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

pub async fn register(
    State(state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let nickname = validate_nickname(&payload.nickname)?;
    let email = normalize_and_validate_email(&payload.email)?;
    validate_password(&payload.password)?;

    let password_hash = hash(payload.password, DEFAULT_COST)?;

    let created_user = users::create_user(
        &state.db,
        NewUser {
            nickname,
            email,
            password_hash,
            is_admin: false,
        },
    )
    .await?;

    let token = state.jwt.issue_token(&created_user)?;

    Ok(Json(AuthResponse {
        token,
        user: PublicUser::from(created_user),
    }))
}

pub async fn login(
    State(state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let email = normalize_and_validate_email(&payload.email)?;

    let user = users::find_user_by_email(&state.db, &email)
        .await?
        .ok_or_else(|| AppError::Unauthorized("invalid email or password".to_string()))?;

    let password_is_valid = verify(payload.password, &user.password_hash)?;
    if !password_is_valid {
        return Err(AppError::Unauthorized(
            "invalid email or password".to_string(),
        ));
    }

    let token = state.jwt.issue_token(&user)?;

    Ok(Json(AuthResponse {
        token,
        user: PublicUser::from(user),
    }))
}

pub async fn me(
    auth_user: AuthUser,
    State(state): State<AppState>,
) -> Result<Json<PublicUser>, AppError> {
    let user = users::find_user_by_id(&state.db, auth_user.id)
        .await?
        .ok_or_else(|| AppError::Unauthorized("user from token no longer exists".to_string()))?;

    Ok(Json(PublicUser::from(user)))
}

fn validate_nickname(value: &str) -> Result<String, AppError> {
    let trimmed = value.trim();
    if trimmed.len() < 3 || trimmed.len() > 32 {
        return Err(AppError::BadRequest(
            "nickname length must be between 3 and 32 characters".to_string(),
        ));
    }

    Ok(trimmed.to_string())
}

fn normalize_and_validate_email(value: &str) -> Result<String, AppError> {
    let trimmed = value.trim().to_lowercase();
    let valid = trimmed.contains('@')
        && !trimmed.starts_with('@')
        && !trimmed.ends_with('@')
        && !trimmed.contains(' ');

    if !valid {
        return Err(AppError::BadRequest(
            "email must be a valid address".to_string(),
        ));
    }

    Ok(trimmed)
}

fn validate_password(value: &str) -> Result<(), AppError> {
    if value.len() < 8 {
        return Err(AppError::BadRequest(
            "password must contain at least 8 characters".to_string(),
        ));
    }

    Ok(())
}

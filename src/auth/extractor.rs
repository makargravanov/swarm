use axum::{
    extract::FromRequestParts,
    http::{header, request::Parts},
};
use uuid::Uuid;

use crate::{app_state::AppState, error::AppError};

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub id: Uuid,
    pub nickname: String,
    pub email: String,
    pub is_admin: bool,
}

#[derive(Debug, Clone)]
pub struct AdminUser(pub AuthUser);

impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let auth_header_value = parts
            .headers
            .get(header::AUTHORIZATION)
            .ok_or_else(|| AppError::Unauthorized("missing Authorization header".to_string()))?
            .to_str()
            .map_err(|_| AppError::Unauthorized("Authorization header is not valid UTF-8".to_string()))?;

        let token = auth_header_value
            .strip_prefix("Bearer ")
            .ok_or_else(|| AppError::Unauthorized("expected Bearer token".to_string()))?;

        let claims = state.jwt.decode_token(token)?;

        let user_id = claims
            .sub
            .parse::<Uuid>()
            .map_err(|_| AppError::Unauthorized("token subject is not valid UUID".to_string()))?;

        Ok(Self {
            id: user_id,
            nickname: claims.nickname,
            email: claims.email,
            is_admin: claims.is_admin,
        })
    }
}

impl FromRequestParts<AppState> for AdminUser {
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let auth_user = AuthUser::from_request_parts(parts, state).await?;

        if !auth_user.is_admin {
            return Err(AppError::Forbidden(
                "admin role is required for this endpoint".to_string(),
            ));
        }

        Ok(Self(auth_user))
    }
}

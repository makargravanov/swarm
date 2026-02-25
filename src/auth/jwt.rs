use crate::{db::users::UserRecord, error::AppError};
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone)]
pub struct JwtService {
    secret: String,
    ttl_seconds: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    pub sub: String,
    pub nickname: String,
    pub email: String,
    pub is_admin: bool,
    pub iat: usize,
    pub exp: usize,
}

impl JwtService {
    pub fn new(secret: String, ttl_seconds: i64) -> Self {
        Self {
            secret,
            ttl_seconds,
        }
    }

    pub fn issue_token(&self, user: &UserRecord) -> Result<String, AppError> {
        let now = Utc::now();
        let exp = now + Duration::seconds(self.ttl_seconds);

        let claims = Claims {
            sub: user.id.to_string(),
            nickname: user.nickname.clone(),
            email: user.email.clone(),
            is_admin: user.is_admin,
            iat: now.timestamp() as usize,
            exp: exp.timestamp() as usize,
        };

        let token = encode(
            &Header::default(),
            &claims,
            &EncodingKey::from_secret(self.secret.as_bytes()),
        )?;

        Ok(token)
    }

    pub fn decode_token(&self, token: &str) -> Result<Claims, AppError> {
        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.secret.as_bytes()),
            &validation,
        )?;

        Ok(token_data.claims)
    }
}

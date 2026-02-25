use crate::error::AppError;
use sqlx::PgPool;
use tracing::{info, warn};

#[derive(Debug, sqlx::FromRow)]
struct ColumnInfo {
    column_name: String,
    data_type: String,
    udt_name: String,
    is_nullable: String,
}

pub async fn ensure_schema(pool: &PgPool) -> Result<(), AppError> {
    sqlx::query("SELECT 1")
        .execute(pool)
        .await
        .map_err(|error| {
            AppError::ServiceUnavailable(format!(
                "unable to reach PostgreSQL during startup: {error}"
            ))
        })?;

    let users_exists: bool = sqlx::query_scalar(
        r#"
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        )
        "#,
    )
    .fetch_one(pool)
    .await?;

    if !users_exists {
        warn!("table 'users' is missing; creating required schema");
        create_users_table(pool).await?;
        info!("table 'users' created");
        return Ok(());
    }

    validate_users_table(pool).await?;
    info!("database schema validated successfully");

    Ok(())
}

async fn create_users_table(pool: &PgPool) -> Result<(), AppError> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            nickname TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            is_admin BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}

async fn validate_users_table(pool: &PgPool) -> Result<(), AppError> {
    let columns: Vec<ColumnInfo> = sqlx::query_as(
        r#"
        SELECT column_name, data_type, udt_name, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
        "#,
    )
    .fetch_all(pool)
    .await?;

    let expected = [
        ("id", "uuid", false),
        ("nickname", "text", false),
        ("email", "text", false),
        ("password_hash", "text", false),
        ("is_admin", "boolean", false),
        ("created_at", "timestamp with time zone", false),
    ];

    if columns.len() != expected.len() {
        return Err(AppError::SchemaMismatch(format!(
            "users table column count mismatch: expected {}, got {}",
            expected.len(),
            columns.len()
        )));
    }

    for (index, (expected_name, expected_type, expected_nullable)) in expected.iter().enumerate() {
        let actual = &columns[index];
        let actual_nullable = actual.is_nullable.eq_ignore_ascii_case("YES");

        if actual.column_name != *expected_name {
            return Err(AppError::SchemaMismatch(format!(
                "users.{} expected column '{}', got '{}'",
                index, expected_name, actual.column_name
            )));
        }

        let type_matches = if *expected_name == "id" {
            actual.udt_name == "uuid"
        } else {
            actual.data_type.eq_ignore_ascii_case(expected_type)
        };

        if !type_matches {
            return Err(AppError::SchemaMismatch(format!(
                "users.{} expected type '{}', got data_type='{}' udt_name='{}'",
                actual.column_name, expected_type, actual.data_type, actual.udt_name
            )));
        }

        if actual_nullable != *expected_nullable {
            return Err(AppError::SchemaMismatch(format!(
                "users.{} expected nullable={}, got nullable={}",
                actual.column_name, expected_nullable, actual_nullable
            )));
        }
    }

    validate_constraints(pool).await?;
    Ok(())
}

async fn validate_constraints(pool: &PgPool) -> Result<(), AppError> {
    let primary_key_ok: bool = sqlx::query_scalar(
        r#"
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
            WHERE tc.table_schema = 'public'
              AND tc.table_name = 'users'
              AND tc.constraint_type = 'PRIMARY KEY'
              AND kcu.column_name = 'id'
        )
        "#,
    )
    .fetch_one(pool)
    .await?;

    let email_unique_ok: bool = sqlx::query_scalar(
        r#"
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
            WHERE tc.table_schema = 'public'
              AND tc.table_name = 'users'
              AND tc.constraint_type = 'UNIQUE'
              AND kcu.column_name = 'email'
        )
        "#,
    )
    .fetch_one(pool)
    .await?;

    let nickname_unique_ok: bool = sqlx::query_scalar(
        r#"
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
              ON tc.constraint_name = kcu.constraint_name
             AND tc.table_schema = kcu.table_schema
            WHERE tc.table_schema = 'public'
              AND tc.table_name = 'users'
              AND tc.constraint_type = 'UNIQUE'
              AND kcu.column_name = 'nickname'
        )
        "#,
    )
    .fetch_one(pool)
    .await?;

    if !primary_key_ok || !email_unique_ok || !nickname_unique_ok {
        return Err(AppError::SchemaMismatch(
            "users table constraints mismatch; expected primary key(id) and unique(email,nickname)".to_string(),
        ));
    }

    Ok(())
}

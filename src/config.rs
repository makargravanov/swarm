use std::{env, net::{IpAddr, SocketAddr}};

pub struct AppConfig {
    pub addr: SocketAddr,
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_secret_is_ephemeral: bool,
    pub jwt_ttl_seconds: i64,
}

impl AppConfig {
    pub fn load() -> Self {
        dotenvy::dotenv().ok();

        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let host_ip = host
            .parse::<IpAddr>()
            .expect("HOST must be a valid IPv4/IPv6 address");

        let port = env::var("PORT")
            .ok()
            .and_then(|value| value.parse::<u16>().ok())
            .unwrap_or(3000);

        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL is required; application will not start without PostgreSQL DSN");

        let jwt_secret_from_env = env::var("JWT_SECRET")
            .ok()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty());

        let jwt_secret_is_ephemeral = jwt_secret_from_env.is_none();
        let jwt_secret = jwt_secret_from_env.unwrap_or_else(generate_secure_jwt_secret);

        let jwt_ttl_seconds = env::var("JWT_TTL_SECONDS")
            .ok()
            .and_then(|value| value.parse::<i64>().ok())
            .unwrap_or(3600);

        Self {
            addr: SocketAddr::from((host_ip, port)),
            database_url,
            jwt_secret,
            jwt_secret_is_ephemeral,
            jwt_ttl_seconds,
        }
    }
}

fn generate_secure_jwt_secret() -> String {
    let bytes: [u8; 64] = rand::random();

    let mut output = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        output.push_str(&format!("{byte:02x}"));
    }

    output
}

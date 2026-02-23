mod http;

use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("failed to bind TCP listener");

    println!("server listening on http://{}", addr);

    axum::serve(listener, http::router())
        .await
        .expect("server failed");
}

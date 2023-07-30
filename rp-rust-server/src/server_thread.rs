use crate::commands::PressenceUpdateCommand;

use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Method, Request, Response, Server, StatusCode};
use tokio::sync::mpsc::Sender;

static PORT: u16 = 3333;

async fn handler(
    req: Request<Body>,
    tx: Sender<PressenceUpdateCommand>,
) -> Result<Response<Body>, hyper::Error> {
    match (req.method(), req.uri().path()) {
        // update discord rich pressence with current track
        (&Method::POST, "/update") => {
            let bytes = hyper::body::to_bytes(req.into_body()).await?;
            let body = serde_json::from_slice::<PressenceUpdateCommand>(&bytes);

            println!("[server]: request {:?}", body);
            match body {
                Ok(req) => tx.send(req).await.unwrap_or_default(),
                Err(err) => {
                    return Ok(Response::builder()
                        .status(StatusCode::BAD_REQUEST)
                        .body(Body::from(err.to_string()))
                        .unwrap_or_default());
                }
            };
            Ok(Response::new(Body::empty()))
        }

        // Return the 404 Not Found for other routes.
        _ => Ok(Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(Body::empty())
            .unwrap_or_default()),
    }
}

pub async fn init_server(tx: Sender<PressenceUpdateCommand>) {
    let addr = ([127, 0, 0, 1], PORT).into();

    let service = make_service_fn(move |_| {
        let tx = tx.clone();
        async move { Ok::<_, hyper::Error>(service_fn(move |req| handler(req, tx.clone()))) }
    });

    let server = Server::bind(&addr).serve(service);

    println!("[server]: server listening on http://{}", addr);
    if let Err(e) = server.await {
        eprintln!("[server]: server error: {}", e)
    }
}

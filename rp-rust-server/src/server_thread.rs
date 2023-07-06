use std::sync::mpsc::Sender;

use crate::commands::PressenceUpdateCommand;

// use futures_util::TryStreamExt;
use hyper::service::{make_service_fn, service_fn};
use hyper::{Body, Method, Request, Response, Server, StatusCode};

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

            if let Ok(req) = body {
                tx.send(req);
            }
            Ok(Response::new(Body::from("")))
        }

        // Return the 404 Not Found for other routes.
        _ => {
            let mut not_found = Response::default();
            *not_found.status_mut() = StatusCode::NOT_FOUND;
            Ok(not_found)
        }
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

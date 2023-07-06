mod commands;
mod discord_thread;
mod server_thread;

use commands::PressenceUpdateCommand;
use discord_thread::init_discord_thread;
use server_thread::init_server;
use std::{sync::mpsc::channel, thread};

use tokio::runtime::Handle;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (tx, rx) = channel::<PressenceUpdateCommand>();

    let discord_thread = thread::spawn(move || init_discord_thread(rx));
    let handler = Handle::current();
    let server_thread = thread::spawn(move || {
        handler.spawn(init_server(tx));
    });

    discord_thread.join().unwrap();
    server_thread.join().unwrap();
    Result::Ok(())
}

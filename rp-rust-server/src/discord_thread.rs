use discord_game_sdk::{Activity, Discord};
use once_cell::sync::Lazy;
use std::time::Duration;
use tokio::sync::mpsc::Receiver;

use crate::commands::PressenceUpdateCommand;

static DISCORD_CLIENT_ID: i64 = 1101542341073961142;

pub fn init_discord_thread(rx: &mut Receiver<PressenceUpdateCommand>) {
    // it closure to avoid handling lifetimes
    let instance = || -> Discord<()> {
        println!("[discord]: init");
        // TODO process discord errors: ServiceUnavailable,NotInstalled,NotRunning
        Discord::new(DISCORD_CLIENT_ID).unwrap()
    };
    let mut discord = Lazy::new(instance);
    let mut prev_command: Option<PressenceUpdateCommand> = None;
    loop {
        let cmd = rx.try_recv();

        match cmd {
            Ok(req) => {
                let current_command = Some(req.clone());
                if prev_command == current_command {
                    continue;
                }

                prev_command = current_command;

                match req {
                    PressenceUpdateCommand::Play(req) => discord.update_activity(
                        &Activity::empty()
                            .with_details(&req.artist)
                            .with_state(&req.track)
                            .with_large_image_key(&req.cover),
                        |_, result| {
                            println!("[discord]: update activity");
                            if let Err(error) = result {
                                return eprintln!(
                                    "[discord]: failed to update activity: {:?}",
                                    error
                                );
                            }
                        },
                    ),
                    PressenceUpdateCommand::Clear => {
                        println!("[discord]: clear activity");
                        discord = Lazy::new(instance);
                    }
                }
            }
            Err(err) => match err {
                tokio::sync::mpsc::error::TryRecvError::Empty => {
                    std::thread::sleep(Duration::from_millis(100));
                }
                tokio::sync::mpsc::error::TryRecvError::Disconnected => break,
            },
        }

        if let Some(_) = Lazy::get(&discord) {
            // TODO log run_callbacks errrors
            discord.run_callbacks();
        }
    }
}

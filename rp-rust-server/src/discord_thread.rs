use discord_game_sdk::{Activity, Discord};
use once_cell::sync::Lazy;
use std::{sync::mpsc::Receiver, time::Duration};

use crate::commands::PressenceUpdateCommand;

static DISCORD_CLIENT_ID: i64 = 1101542341073961142;

pub fn init_discord_thread(rx: Receiver<PressenceUpdateCommand>) {
    // it closure to avoid handling lifetimes
    let instance = || -> Discord<()> {
        println!("[discord]: init");
        Discord::new(DISCORD_CLIENT_ID).unwrap()
    };
    let mut discord = Lazy::new(instance);
    let mut prev_command: Option<PressenceUpdateCommand> = None;
    loop {
        if let Ok(req) = rx.recv_timeout(Duration::from_millis(100)) {
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
                            return eprintln!("[discord]: failed to update activity: {:?}", error);
                        }
                    },
                ),
                PressenceUpdateCommand::Clear => {
                    println!("[discord]: clear activity");
                    discord = Lazy::new(instance);
                }
            }
        }

        if let Some(_) = Lazy::get(&discord) {
            discord.run_callbacks();
        }
    }
}

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct PressenceTrackData {
    pub artist: String,
    pub track: String,
    pub cover: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(tag = "type")]
pub enum PressenceUpdateCommand {
    #[serde(rename = "update")]
    Play(PressenceTrackData),
    #[serde(rename = "clear")]
    Clear,
}

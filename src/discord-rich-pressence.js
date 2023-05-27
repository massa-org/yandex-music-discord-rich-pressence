import { Client } from "@xhayper/discord-rpc";
import fastify from "fastify";

const instance = fastify({ logger: true });
const discord = new Client({
  clientId: "1101542341073961142",
  transport: { type: "ipc" },
});

let discordIsReady = false;
let lastUpdateData = null;

// rich pressence command
// type rpc = {type: 'clear'} | {type: 'update',artist,track,cover}

function updatePresence(updateCommand) {
  const { type } = updateCommand;
  if (type == "clear") {
    discord?.user.clearActivity();
  } else if (type == "update") {
    const { track, artist, cover } = updateCommand;
    discord.user?.setActivity({
      state: artist,
      details: track,
      largeImageKey: cover ?? "yandex-music-icon",
    });
  }
}

instance.post("/update", async (req, res) => {
  // omit unused parameters
  const { track, artist, cover, type } = req.body;
  const updateData = { track, artist, cover, type };
  if (!discordIsReady) {
    lastUpdateData = updateData;
    return {};
  }
  updatePresence(updateData);

  return {};
});

discord.on("ready", () => {
  console.log("Discord connected");
  discordIsReady = true;
  if (lastUpdateData != null) {
    updatePresence(lastUpdateData);
  }
});

discord.login();
instance.listen({ port: 3333, host: "0.0.0.0" }, () =>
  console.log("server listen on port:3333")
);

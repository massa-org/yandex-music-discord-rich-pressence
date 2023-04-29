import { Client } from "@xhayper/discord-rpc";
import fastify from "fastify";

const instance = fastify({ logger: true });
const discord = new Client({
  clientId: "1101542341073961142",
  transport: { type: "ipc" },
});

const readyPromise = new Promise((r, e) =>
  discord.on("ready", () => {
    console.log("Discord connected");
    r();
  })
);
instance.post("/update", async (req, res) => {
  await readyPromise;
  const { track, artist, cover } = req.body;

  discord.user?.setActivity({
    state: artist,
    details: track,
    largeImageKey: cover?.replace("50x50", "400x400") ?? "yandex-music-icon",
    // startTimestamp: 1682706503686,
    // endTimestamp: 1682706503686 + 300 * 1000,
    // buttons: [
    //   {
    //     label: 'Link to track',
    //     url: 'https://music.yandex.ru/album/20353/track/201155',
    //   }
    // ]
  });

  return {};
});

discord.login();
instance.listen({ port: 3333, host: "0.0.0.0" }, () =>
  console.log("server listen on port:3333")
);

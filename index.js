const fs = require("node:fs");
const path = require("node:path");
const Topgg = require("@top-gg/sdk");
const express = require("express");
const app = express();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { config } = require("dotenv/config");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

const { token, topggtoken, auth } = require("./config.json");

const webhook = new Topgg.Webhook(auth);

app.post(
  "/dblwebhook",
  webhook.listener((vote) => {
    rolls.addRoll(vote.user, vote.isWeekend);

    console.log(`${vote.user} ha votado!`);
  })
);

app.get("/dblwebhook", function (req, res) {
  res.send("webhook");
});

const { AutoPoster } = require("topgg-autoposter");

AutoPoster(topggtoken, client).on("posted", () => {
  console.log("Posted stats to Top.gg!");
});

app.get("/", function (req, res) {
  res.send("pichula");
});
let port = process.env.PORT || 3000;

app.listen(port);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);

const { REST, Routes } = require("discord.js");
const { clientId, guildId } = require("./config.json");
const { config } = require("dotenv/config");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const adminCommands = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      // Verifica si el comando pertenece a la carpeta "admin"
      if (folder.toLowerCase() !== "admin") {
        commands.push(command.data.toJSON());
      }
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} global application (/) commands.`
    );

    // Despliega los comandos que no son de administración de forma global
    const globalCommandsData = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(
      `Successfully reloaded ${globalCommandsData.length} global application (/) commands.`
    );

  } catch (error) {
    console.error(error);
  }
})();

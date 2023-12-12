const { Events } = require("discord.js");
const dbguild = require("../databaseFunctions/dbGuild");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    client.user.setActivity({ name: "| /padoru | /help" });
    console.log("Nero esta on fire");

    const guilds = client.guilds.cache;

    // Itera sobre la lista de guilds e imprime información
    guilds.forEach(async (guild) => {
      console.log(`Bot is in guild: ${guild.name} (ID: ${guild.id})`);
      await dbguild.getGuild(guild);
    });

    // Usar para borrar comandos
    //client.application.commands.set([]);
    console.log(client.application.commands);

    console.log("Conectando a mongo...");
    const mongo = require("../mongo");
    mongo();
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};

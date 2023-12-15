const { Events } = require("discord.js");
const dbguild = require("../databaseFunctions/dbGuild");

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    client.user.setActivity({ name: "| /padoru | /help" });
    console.log("Nero esta on fire");

    client.application.commands.set(client.commands.map(v => v.data)).then(cmds => {
        cmds.toJSON().forEach(cmd => {
            const rawCommand = client.commands.get(cmd.name);

            rawCommand.id = cmd.id;

            client.commands.set(cmd.name, rawCommand);
        })
    });

    // Usar para borrar comandos
    //client.application.commands.set([]);

    console.log("Conectando a mongo...");
    const mongo = require("../mongo");
    mongo();
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};

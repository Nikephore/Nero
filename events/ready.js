const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.user.setActivity("el gran incendio de Roma", { type: "WATCHING" });
    console.log("Nero esta on fire");

    // Usar para borrar comandos
    //client.application.commands.set([]);
    console.log(client.application.commands);

    console.log("Conectando a mongo...");
    const mongo = require("../mongo");
    mongo();
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};

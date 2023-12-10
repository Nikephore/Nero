const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("felizjueves")
    .setDescription(`Feliz Jueves`),
  async execute(interaction) {
    await interaction.reply(
      "https://cdn.discordapp.com/attachments/460204224857243649/909795268529127474/felizjueves.gif"
    );
  },
};

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("aggressive")
    .setDescription(`You have Padoru'd your last Padoru`),
  async execute(interaction) {
    await interaction.reply(
      "https://cdn.discordapp.com/attachments/901798915425321000/907040273098493982/padoru_murder.png"
    );
  },
};

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("stonks")
    .setDescription(`Stonks meme with Padoru`),
  async execute(interaction) {
    await interaction.reply(
      "https://cdn.discordapp.com/attachments/901798915425321000/902693878501634071/stonks.jpg"
    );
  },
};

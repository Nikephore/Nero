const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: "fun",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("lyrics")
    .setDescription("Hashire sori yo..."),
  async execute(interaction) {
    await interaction.reply(`
\nHashire sori yo
Kaze no you ni
Tsukimihara wo
Padoru Padoru
\nHashire sori yo
Kaze no you ni
Tsukimihara wo
Padoru Padoru
              `);
  },
};

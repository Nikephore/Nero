const roll = require("../../functions/padoruRoll");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: "padoru",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("voterolls")
    .setDescription("Use the rolls obtained through voting")
    .addIntegerOption((option) =>
      option
        .setName("numberrolls")
        .setDescription("Number of Padorus to roll. Max 10")
    ),
  async execute(interaction) {
    await roll.padoruRoll(interaction, true);
  },
};

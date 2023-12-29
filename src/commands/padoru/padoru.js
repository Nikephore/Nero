const roll = require("../../functions/padoruRoll");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: "padoru",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("padoru")
    .setDescription("Obtain a Padoru for your collection")
    .addIntegerOption((option) =>
      option.setName("numberrolls").setDescription("Number of Padorus to roll")
    ),
  async execute(interaction) {
    await roll.padoruRoll(interaction, false);
  },
};

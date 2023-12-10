const fs = require("fs");
const dbprofile = require("../../databaseFunctions/dbProfile");
const dbadoru = require("../../databaseFunctions/dbPadoru");
const dbguild = require("../../databaseFunctions/dbGuild");
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const filter = require("../../functions/filter");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help menu to use the Padoru Bot"),

  async execute(interaction) {
    try {
      //dbadoru.removefield()
      //dbguild.getGuild(interaction.guild)
      const select = new StringSelectMenuBuilder()
        .setCustomId("help")
        .setPlaceholder("Categories")
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Economy")
            .setDescription("Obtain or use your PadoruCoins and Tickets.")
            .setValue("economy")
            .setEmoji("🪙"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Fun")
            .setDescription("Memes and fun commands.")
            .setValue("fun")
            .setEmoji("🎡"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Information")
            .setDescription("Information commands")
            .setValue("info")
            .setEmoji("❗"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Padoru")
            .setDescription("Roll Padorus and see them")
            .setValue("padoru")
            .setEmoji("901832288378187816")
        );

      const row = new ActionRowBuilder().addComponents(select);

      await interaction.reply({
        content: "Help Menu",
        components: [row],
      });
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

const fs = require("fs");
const dbprofile = require("../../databaseFunctions/dbProfile");
const {
  ActionRowBuilder,
  ComponentType,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deleteaccount")
    .setDescription("Delete all your information from Nero"),

  async execute(interaction) {
    try {

      const confirm = new ButtonBuilder()
        .setCustomId("delete")
        .setLabel("DELETE")
        .setStyle(ButtonStyle.Danger);

      const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(cancel, confirm);


      await interaction.deferReply({ ephemeral: true });

      const msg = await interaction.editReply({
        content: ':warning: **Are you sure you want to delete all your data related to this bot?** :warning:',
        ephemeral: true,
        components: [row],
        fetchReply: true,
      });

      const collector = await msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.editReply({
            content: "You can't use these buttons",
            ephemeral: true,
          });
        }

        await i.deferUpdate();

        if (i.customId === "delete") {
          await dbprofile.delete(
            i.user);
          return i.editReply({
            content: "Profile deleted.",
            ephemeral: true,
            components: [],
          });
        } else if (i.customId === "cancel") {
          return i.editReply({
            content: "Few...",
            ephemeral: true,
            components: [],
          });
        }
      });

      collector.on("end", async (i) => {});
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};
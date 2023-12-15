const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { response } = require("express");
const fs = require("fs");
const path = require("path");

module.exports = {
  category: "information",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help menu to use the Padoru Bot"),

  async execute(interaction) {
    try {
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
            .setValue("information")
            .setEmoji("❗"),
          new StringSelectMenuOptionBuilder()
            .setLabel("Padoru")
            .setDescription("Roll Padorus and see them")
            .setValue("padoru")
            .setEmoji("901832288378187816")
        );

      const { client } = interaction;

      const initialRow = new ActionRowBuilder().addComponents(select);

      const helpMessage = await interaction.reply({
        content: "Select a category to obtain more information about its commands.",
        components: [initialRow],
        fetchReply: true,
      });

      const filter = (interaction) =>
        interaction.customId === "help" && interaction.isStringSelectMenu();

      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: "You can't use these buttons",
            ephemeral: true,
          });
        }
        const selectedCategory = i.values[0];

        await i.deferUpdate();

        const commandsInCategory = client.commands
          .filter((command) => command.category === selectedCategory)
          .toJSON();

        // Crear el embed con los campos name y description para cada comando
        const response = new EmbedBuilder()
          .setTitle(
            `${
              selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1)
            } commands`
          )
          .setColor("#0099ff")
          .setThumbnail(
            "https://nerobotfiles.s3.eu-west-3.amazonaws.com/uploads/18/18.png"
          );

        commandsInCategory.forEach((command) => {
          response.addFields({
            name: `</${command.data.name}:${command.id}>`,
            value: command.data.description,
          });
        });

        // Crea una nueva instancia de ActionRowBuilder para evitar problemas de referencia
        const newRow = new ActionRowBuilder().addComponents(select);
        await helpMessage.edit({
          content: "",
          embeds: [response],
          components: [newRow],
        });

        collector.resetTimer();
      });

      collector.on("end", async (i) => {
        const channel = interaction.channel;
        if (!channel) {
          return false; // El canal asociado a la interacción no existe
        }

        await helpMessage.edit({
          components: [],
        });
      });
    } catch (err) {
      console.log("Error occurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

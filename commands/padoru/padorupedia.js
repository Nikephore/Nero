const dbpadoru = require("../../databaseFunctions/dbPadoru");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const math = require("../../functions/math");
const pagination = require("../../functions/pagination");
const filter = require("../../functions/filter");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("padorupedia")
    .setDescription("List of all Padorus")
    .addStringOption((option) =>
      option
        .setName("sort")
        .setDescription("Type of sort")
        .setRequired(true)
        .addChoices(
          { name: "id", value: "id" },
          { name: "abc", value: "abc" },
          { name: "rarity", value: "rarity" }
        )
    )
    .addNumberOption((option) =>
      option.setName("page").setDescription("Page of the Padorupedia")
    )
    .addStringOption((option) =>
      option.setName("series").setDescription("Filter the series")
    ),
  async execute(interaction) {
    try {
      const sort = interaction.options.getString("sort");
      let numberPage = interaction.options.getNumber("page") ?? 1;
      const mySeries = interaction.options.getString("series") ?? "";

      const leyenda =
        ":no_entry_sign: = You can't roll this Padoru right now\n:bangbang: = Padoru rate up!!";
      const embedsArray = [];
      let padorupedia = await dbpadoru.getAll(sort);
      if (numberPage <= 0 && typeof numberPage !== "number") numberPage = 1;

      // First of all we defer reply
      await interaction.deferReply();

      // Filter the series
      if (mySeries !== "") {
        padorupedia = await filter.seriesFilter(
          interaction,
          padorupedia,
          mySeries,
          interaction.user
        );
        if (!padorupedia) return;
      }

      // Sort the padorupedia
      padorupedia = await filter.sortByFlag(sort, padorupedia);

      const padoruTitles = padorupedia.map(
        (p) =>
          "``" +
          p.id +
          "`` " +
          p.title +
          "\t" +
          math.rarityConvertAscii(p.rarity) +
          (p.active ? "" : ":no_entry_sign:") +
          (p.banner ? ":bangbang:" : "")
      );

      const page = 15;
      const totalPages = Math.ceil(padoruTitles.length / page);

      numberPage > totalPages
        ? (numberPage = totalPages)
        : (numberPage = numberPage);

      let index = numberPage; // Inicializa el índice con numberPage
      let startIndex = (index - 1) * page;
      let endIndex = startIndex + page;

      let parcialTitles = padoruTitles.slice(startIndex, endIndex);

      for (let i = 0; i < totalPages; i++) {
        const embed = new EmbedBuilder()
          .setTitle("Padorupedia")
          .setColor("ebc334")
          .setFooter({ text: `Page ${index}/${totalPages}` })
          .addFields(
            {
              name: "Symbols",
              value:
                ":no_entry_sign: = You can't roll this Padoru right now\n:bangbang: = Padoru rate up!!",
            },
            {
              name: "\u200B",
              value: parcialTitles.join("\n"),
            }
          );

        embedsArray.push(embed);

        // Actualiza los índices y la selección de títulos de manera circular
        index++;
        if (index > totalPages) {
          index = 1;
        }
        startIndex = (index - 1) * page;
        endIndex = startIndex + page;
        parcialTitles = padoruTitles.slice(startIndex, endIndex);
      }

      pagination.buttonPages(interaction, embedsArray);
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

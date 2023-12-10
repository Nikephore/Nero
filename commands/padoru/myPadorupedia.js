const dbpadoru = require("../../databaseFunctions/dbPadoru");
const dbprofile = require("../../databaseFunctions/dbProfile");
const dbseries = require("../../databaseFunctions/dbSeries");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const math = require("../../functions/math");
const pagination = require("../../functions/pagination");
const filter = require("../../functions/filter");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("mypadorupedia")
    .setDescription("List of all your Padorus")
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
    .addUserOption((option) =>
      option.setName("user").setDescription("User to see Padorupedia")
    )
    .addNumberOption((option) =>
      option.setName("page").setDescription("Page of the Padorupedia")
    )
    .addStringOption((option) =>
      option.setName("series").setDescription("Filter the series")
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user") ?? interaction.user;
      let numberPage = interaction.options.getNumber("page") ?? 1;
      const sort = interaction.options.getString("sort");
      const mySeries = interaction.options.getString("series") ?? "";

      const leyenda =
        ":no_entry_sign: = You can't roll this Padoru right now\n:bangbang: = Padoru rate up!!\n☆ = Upgraded Padoru";
      const embedsArray = [];
      let padorupedia = await dbpadoru.getAll(sort);
      let profile = await dbprofile.getProfile(user, interaction.guild);
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);

      if (numberPage <= 0 && typeof numberPage !== "number") numberPage = 1;

      // First of all we defer reply
      await interaction.deferReply();

      if (profile.padorupedia.length === 0) {
        await interaction.editReply({
          content: `${user.username}'s Padorupedia is empty. Use /padoru to start playing!`,
        });
        return;
      }

      // Filter the series
      if (mySeries !== "") {
        padorupedia = await filter.seriesFilter(
          interaction,
          padorupedia,
          mySeries,
          user
        );
        if (!padorupedia) return;
      }

      // Sort the padorupedia
      profile.padorupedia = await filter.sortByFlag(sort, profile.padorupedia);

      const myPadoruIds = profile.padorupedia.map((padoru) => padoru.id);
      const filteredPadorupedia = padorupedia.filter((padoru) =>
        myPadoruIds.includes(padoru.id)
      );

      if (filteredPadorupedia.length === 0) {
        await interaction.editReply({
          content: `${user.username} don't have any Padoru from that series. Use /padoru to start playing!`,
        });
        return;
      }

      let myPadoruIndex = 0;
      filteredPadorupedia.forEach(function (padoru) {
        padoru.timesClaimed = profile.padorupedia[myPadoruIndex].timesClaimed;
        padoru.upgrade = profile.padorupedia[myPadoruIndex].rarity;
        padoru.ascension = profile.padorupedia[myPadoruIndex].ascension;
        myPadoruIndex++;
      });

      const padoruTitles = filteredPadorupedia.map(
        (p) =>
          "``" +
          p.id +
          "`` " +
          p.title +
          "\t" +
          math.rarityConvertAscii(p.rarity, p.upgrade) +
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
          .setTitle(`${user.username}'s Padorupedia`)
          .setColor(profile.colors.padorupedia)
          .setThumbnail(profile.favpadoru)
          .setFooter({ text: `Page ${index}/${totalPages}` })
          .addFields(
            {
              name: "Symbols",
              value:
                ":no_entry_sign: = You can't roll this Padoru right now\n:bangbang: = Padoru rate up!!\n☆ = Upgraded Padoru",
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

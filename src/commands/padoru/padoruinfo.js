const dbpadoru = require("../../databaseFunctions/dbPadoru");
const dbguild = require("../../databaseFunctions/dbGuild");
const { SlashCommandBuilder, EmbedBuilder, } = require("discord.js");
const math = require("../../functions/math");
const pagination = require("../../functions/pagination");
const filter = require("../../functions/filter");
const { rarityColorArray } = require ('../../variables/colors');

module.exports = {
  category: "padoru",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("padoruinfo")
    .setDescription("Detailed list of all Padorus")
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
      option.setName("index").setDescription("Index of the list")
    )
    .addStringOption((option) =>
      option.setName("series").setDescription("Filter the series")
    ),

  async execute(interaction) {
    try {
      const sort = interaction.options.getString("sort");
      let padorupedia = await dbpadoru.getAll(sort);
      const embedsArray = [];
      const guild = await dbguild.getGuild(interaction.guild);
      const mySeries = interaction.options.getString("series") ?? "";
      const timestamp = new Date().getTime();

      // First of all we defer reply
      await interaction.deferReply();

      let indexInArray = interaction.options.getNumber("index") ?? 1;
      indexInArray--;
      if (indexInArray < 0 || indexInArray >= padorupedia.length) {
        await interaction.editReply({
          content: `The index must be between 1 and ${padorupedia.length}`,
          ephemeral: true,
        });
        return;
      }

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

      for (let i = 0; i < padorupedia.length; i++) {
        let padoru = padorupedia[indexInArray];
        let padoruguild = guild.padorupedia.find((p) => p.id === padoru.id);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `#${padoru.id} ${padoru.title}` })
          .setTitle(math.rarityConvertEmoji(padoru.rarity))
          .setDescription(padoru.description)
          .setImage(`${padoru.image}?timestamp=${timestamp}`)
          .setColor(rarityColorArray[padoru.rarity])
          .setFooter({
            text: `Owner: ${
              padoruguild.owner.username
            } | Life: ${math.lifeConvertEmojiFooter(padoruguild.life)}`,
          })
          .addFields(
            {
              name: "Artist",
              value: `[Link to artist page](${padoru.artist})`,
            },
            {
              name: (padoru.banner ? "📈 Padoru rate up 📈" : " ").concat(
                padoru.active
                  ? " "
                  : "🚫 You can't roll this Padoru right now 🚫"
              ),
              value: `\u200B`,
            }
          );

        embedsArray.push(embed);
        indexInArray = (indexInArray + 1) % padorupedia.length;
      }

      console.log(interaction.user);

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

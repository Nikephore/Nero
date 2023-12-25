const dbpadoru = require("../../databaseFunctions/dbPadoru");
const dbprofile = require("../../databaseFunctions/dbProfile");
const dbguild = require("../../databaseFunctions/dbGuild");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const math = require("../../functions/math");
const pagination = require("../../functions/pagination");
const filter = require("../../functions/filter");

module.exports = {
  category: "padoru",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("mypadorupediaimage")
    .setDescription("List of all your claimed Padorus with detailed information")
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
      option.setName("index").setDescription("Index of the list")
    )
    .addStringOption((option) =>
      option.setName("series").setDescription("Series of the Padorus")
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user") ?? interaction.user;
      const sort = interaction.options.getString("sort");
      const colors = [
        "",
        "f54040",
        "2cbf2e",
        "2ea0d1",
        "9f2ae8",
        "f2e01d",
        "ffffff",
      ];
      const embedsArray = [];
      let padorupedia = await dbpadoru.getAll(sort);
      let profile = await dbprofile.getProfile(user, interaction.guild);
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const guild = await dbguild.getGuild(interaction.guild);
      const mySeries = interaction.options.getString("series") ?? "";

      if (profile.padorupedia.length === 0) {
        await interaction.reply({
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

      // First of all we defer reply
      await interaction.deferReply();

      if (filteredPadorupedia.length === 0) {
        await interaction.editReply({
          content: `${user.username} don't have any Padoru from that series. Use /padoru to start playing!`,
        });
        return;
      }

      let indexInArray = interaction.options.getNumber("index") ?? 1;
      if (indexInArray < 1) indexInArray = 1;
      if (indexInArray > filteredPadorupedia.length) indexInArray = filteredPadorupedia.length;
      indexInArray--;

      let myPadoruIndex = 0;
      filteredPadorupedia.forEach(function (padoru) {
        padoru.timesClaimed = profile.padorupedia[myPadoruIndex].timesClaimed;
        padoru.upgrade = profile.padorupedia[myPadoruIndex].rarity;
        padoru.ascension = profile.padorupedia[myPadoruIndex].ascension;
        myPadoruIndex++;
      });

      for (let i = 0; i < filteredPadorupedia.length; i++) {
        let padoru = filteredPadorupedia[indexInArray];
        let padoruguild = guild.padorupedia.find((p) => p.id === padoru.id);
        const embed = new EmbedBuilder()
          .setAuthor({ name: `#${padoru.id} ${padoru.title}` })
          .setTitle(math.rarityConvertEmoji(padoru.rarity, padoru.upgrade))
          .setDescription(padoru.description)
          .setImage(padoru.image)
          .setColor(colors[padoru.rarity])
          .setFooter({
            text: `Padoru ${indexInArray + 1}/${filteredPadorupedia.length}`,
          })
          .addFields(
            {
              name: "Artist",
              value: `${padoru.artist}`,
            },
            {
              name: `Times Claimed: ${padoru.timesClaimed}`,
              value: `Owner: ${
                padoruguild.owner.username
              } | Life: ${math.lifeConvertEmoji(padoruguild.life)}`,
            }
          );

        embedsArray.push(embed);
        indexInArray = (indexInArray + 1) % filteredPadorupedia.length;
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

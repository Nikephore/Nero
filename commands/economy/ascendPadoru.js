const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const { SlashCommandBuilder, time } = require("discord.js");
const math = require("../../functions/math");

module.exports = {
    category: 'economy',
  data: new SlashCommandBuilder()
    .setName("ascendpadoru")
    .setDescription(
      "Ascend your Padoru when you claim it enough times and obtain badges."
    )
    .addNumberOption((option) =>
      option.setName("id").setDescription("Padoru ID").setRequired(true)
    ),

  async execute(interaction) {
    try {
      let profile = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const id = interaction.options.getNumber("id");
      const length = await dbpadoru.getLength();

      const timesClaimedToAscendArray = [25, 100, 500];
      const coinsToAscendArray = [0, 10000, 25000];
      const ticketsToAscendArray = [10, 25, 50];
      const maxAscension = timesClaimedToAscendArray.length;

      // First of all we defer reply
      await interaction.deferReply();

      if (id <= 0 || id > length) {
        await interaction.editReply({
          content: `Select a id between 1 and ${length}`,
          ephemeral: true,
        });
        return;
      }

      // Obtenemos datos del Padoru
      const padoru = await dbpadoru.pick(id);

      // Comprobamos si lo tenemos desbloqueado
      const index = profile.padorupedia.map((p) => p.id).indexOf(id);
      console.log(index);
      if (index === -1) {
        await interaction.editReply({
          content: `You don't have **${padoru.title}** unlocked`,
          ephemeral: true,
        });
        return;
      }

      // Comprobamos si ya esta en su ascension maxima
      if (profile.padorupedia[index].ascension > maxAscension) {
        await interaction.editReply({
          content: "This Padoru is in its maximum ascension!!",
          ephemeral: true,
        });
        return;
      }

      // Comprobamos si lo hemos obtenido las suficientes veces
      const timesClaimedToAscend =
        timesClaimedToAscendArray[profile.padorupedia[index].ascension];
      if (timesClaimedToAscend > profile.padorupedia[index].timesClaimed) {
        await interaction.editReply({
          content: `You need to roll **${
            timesClaimedToAscend - profile.padorupedia[index].timesClaimed
          }** more times to ascend **${padoru.title}**`,
          ephemeral: true,
        });
        return;
      }

      // Comprobamos si tenemos los recursos suficientes para ascenderlo
      const coinsToAscend =
        coinsToAscendArray[profile.padorupedia[index].ascension];
      const ticketsToAscend =
        ticketsToAscendArray[profile.padorupedia[index].ascension];
      if (
        coinsToAscend > profile.resources.padoruCoins &&
        ticketsToAscend > profile.resources.tickets
      ) {
        await interaction.editReply({
          content: `You need **${coinsToAscend}** <:padorucoin2:1187212082735747143> and **${ticketsToAscend}** 🎟️  to ascend **${padoru.title}**`,
          ephemeral: true,
        });
        return;
      }

      await dbprofile.ascendPadoru(interaction.user, id, interaction.guild);
      await dbprofile.addTicket(
        interaction.user,
        -ticketsToAscend,
        interaction.guild
      );
      if (coinsToAscend > 0) {
        await dbprofile.addCoins(
          interaction.user,
          -coinsToAscend,
          interaction.guild
        );
      }

      await interaction.editReply(
        `**${padoru.title}** ascended to level ${
          profile.padorupedia[index].ascension + 1
        }`
      );
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

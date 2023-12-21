const dbprofile = require("../../databaseFunctions/dbProfile");
const { SlashCommandBuilder } = require("discord.js");
const math = require("../../functions/math");

module.exports = {
  category: "economy",
  cooldown: 72000, // 20 horas
  data: new SlashCommandBuilder()
    .setName("dailycoins")
    .setDescription("Obtain some Coins and tickets. /shop to use them"),
  async execute(interaction) {
    try {
      let profile = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const coins = profile.skills.dailycoins.dc;

      await dbprofile.dailyCoins(interaction.user, coins, interaction.guild);

      await interaction.reply(
        `${interaction.user} obtained ${coins} <:padorucoin:1187209585380048936> and 1 🎟️`
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

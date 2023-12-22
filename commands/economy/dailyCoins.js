const dbprofile = require("../../databaseFunctions/dbProfile");
const { SlashCommandBuilder } = require("discord.js");
const Duration = require("humanize-duration");
const math = require("../../functions/math");

module.exports = {
  category: "economy",
  cooldown: 3,
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
      const coins = profile.skills.dailycoins.dc + (profile.padorupedia.length*profile.skills.dailycoins.level);


      if (!profile.consumables.daily) {
        let remaining = Duration((1440 + math.normalizeDate(24)) * 60000, {
          units: ["h", "m", "s"],
          maxDecimalPoints: 0,
          language: "en",
        });
        await interaction.reply(`Next reset of /dailycoins in **${remaining}**`);
        return;
      }

      await dbprofile.dailyCoins(interaction.user, coins, interaction.guild);

      await interaction.reply(
        `${interaction.user} obtained ${coins} <:padorucoin2:1187212082735747143> and 1 🎟️`
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

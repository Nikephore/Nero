const { SlashCommandBuilder } = require("discord.js");
const dbprofile = require("../../databaseFunctions/dbProfile");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("vote")
    .setDescription("Vote for Nero to obtain rolls"),
  async execute(interaction) {
    try {
      let user = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      const rolls = user.voteRolls;

      await interaction.reply(
        `**${rolls} rolls available**\n\nVote for Nero every 12 hours at the link below to obtain more rolls. You can use the available rolls with the /voterolls command.\nhttps://top.gg/bot/442790194555650048/vote`
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

const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("favpadoru")
    .setDescription("Choose your favorite Padoru")
    .addNumberOption((option) =>
      option
        .setName("padoruid")
        .setDescription("ID from the Padoru to choose")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const length = await dbpadoru.getLength();

      const id = interaction.options.getNumber("padoruid");

      if (isNaN(id) || id < 1 || id > length) {
        await interaction.reply({
          content: `Invalid Padoru ID, choose a number between 1 and ${length}`,
          ephemeral: true,
        });
        return;
      }

      const padoru = await dbpadoru.pick(id);

      await dbprofile.setFavPadoru(
        interaction.user,
        padoru.image,
        interaction.guild
      );

      await interaction.reply({
        content: `Your new favorite Padoru is ${padoru.title}`,
        ephemeral: true,
      });
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

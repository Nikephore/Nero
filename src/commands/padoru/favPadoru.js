const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const background = require("../../functions/background");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  category: "padoru",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("favpadoru")
    .setDescription("Choose your favorite Padoru, which will be displayed in your profile")
    .addNumberOption((option) =>
      option
        .setName("padoruid")
        .setDescription("ID from the Padoru to choose")
        .setRequired(true)
    ),
  async execute(interaction) {
    try {
      const length = await dbpadoru.getLength();
      let profile = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const id = interaction.options.getNumber("padoruid");

      if (isNaN(id) || id < 1 || id > length) {
        await interaction.reply({
          content: `Invalid Padoru ID, choose a number between 1 and ${length}`,
          ephemeral: true,
        });
        return;
      }

      

      const padoru = await dbpadoru.pick(id);
      const index = profile.padorupedia.map((p) => p.id).indexOf(id);
      if (index === 100) {
        await interaction.reply({
          content: "Padoru Parade is a special Padoru that can't be setted as your favorite",
          ephemeral: true,
        });
        return;
      }
      if (index === -1) {
        await interaction.reply({
          content: `You don't have **${padoru.title}** unlocked`,
          ephemeral: true,
        });
        return;
      }

      await dbprofile.setFavPadoru(
        interaction.user,
        padoru.image,
        interaction.guild
      );

      const exhibitor = await background.setExhibitor(interaction.user, id);

      const embed = new EmbedBuilder()
          .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() }, )
          .setTitle(`Your new favorite Padoru is ${padoru.title}`)
          .setImage(exhibitor)
          .setColor('e6b60b')
          .setFooter({
            text: '/exhibitor to see your exhibitor',
          })

      await interaction.reply({ embeds: [embed]});
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

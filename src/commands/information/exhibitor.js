const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: "information",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("exhibitor")
    .setDescription("Command to see the exhibitor of a user")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to see profile")
    ),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user") ?? interaction.user;
      // First of all we defer reply
      await interaction.deferReply();

      const timestamp = new Date().getTime();

      await interaction.editReply({ content: `https://nerobotfiles.s3.eu-west-3.amazonaws.com/exhibitors/${user.id}.jpg?timestamp=${timestamp}` });
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};
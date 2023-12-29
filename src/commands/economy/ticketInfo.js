const dbprofile = require("../../databaseFunctions/dbProfile");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  category: "economy",
  data: new SlashCommandBuilder()
    .setName("ticketinfo")
    .setDescription("Display Ticket information"),

  async execute(interaction) {
    try {
      let profile = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const tickets = profile.resources.tickets;

      const { client } = interaction;
      const padorupediaCommand = client.commands.find((command) => command.data.name === "padorupedia");
      const upgradeCommand = client.commands.find((command) => command.data.name === "upgradepadoru");
      const buyCommand = client.commands.find((command) => command.data.name === "buypadoru");
      const ascendCommand = client.commands.find((command) => command.data.name === "ascendpadoru");

      const embed = new EmbedBuilder()
        .setAuthor({ name: `🎟️ Ticket information 🎟️` })
        .setColor("f54040")
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/901798915425321000/903364058818953236/padoru_shiro.png"
        )
        .setDescription(
          `Use tickets to upgrade or ascend your padorus or buy the ones you don't have yet.\n\nYou can see the full padoru list writing </${padorupediaCommand.data.name}:${padorupediaCommand.id}>`
        )
        .addFields(
          {
            name: `Buy Padorus\t</${buyCommand.data.name}:${buyCommand.id}>`,
            value: `Padoru 1 :star: = 15 🎟️\nPadoru 2 :star: = 30 🎟️\nPadoru 3 :star: = 60 🎟️\nPadoru 4 :star: = 100 🎟️\nPadoru 5 :star: = 200 🎟️`,
          },
          {
            name: `Upgrade Padorus\t</${upgradeCommand.data.name}:${upgradeCommand.id}>`,
            value: `Padoru 1 :star: = 5 🎟️\nPadoru 2 :star: = 7 🎟️\nPadoru 3 :star: = 10 🎟️\nPadoru 4 :star: = 15 🎟️\nPadoru 5 :star: = 25 🎟️\nPadoru 6 :star: = 100 🎟️`,
          },
          {
            name: `Ascend Padorus\t</${ascendCommand.data.name}:${ascendCommand.id}>`,
            value: `First Ascension = 10 🎟️\nSecond Ascension = 25 🎟️ +10.000 <:padorucoin2:1187212082735747143> \nThird Ascension = 50 🎟️ + 25.000 <:padorucoin2:1187212082735747143>`,
          },
          {
            name: `${interaction.user.username} has **${tickets}** 🎟️`,
            value: `\u200B`,
          }
        );

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

const dbguild = require("../../databaseFunctions/dbGuild");
const pagination = require("../../functions/pagination");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  category: "padoru",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("top")
    .setDescription("See the Padoru Leaderboard of the server"),
  // .addStringOption((option) =>
  //   option
  //     .setName("type")
  //     .setDescription(
  //       "Type of Leaderboard, choose between owned and collected"
  //     )
  //     .setRequired(true)
  //     .addChoices(
  //       { name: "owned", value: "owned" },
  //       { name: "collected", value: "collected" }
  //     )
  // ),
  async execute(interaction) {
    try {
      // First of all we defer reply
      await interaction.deferReply();
      const guild = await dbguild.getGuild(interaction.guild);
      // const type = interaction.options.getString("type");

      // console.log(type);
      // Objeto para almacenar el recuento de usernames
      const usernameCount = {};
      const usersPerPage = 15;

      // Iterar sobre el array y contar los usernames
      guild.padorupedia.forEach((item) => {
        const username = item.owner.username;

        // Incrementar el recuento o inicializar en 1 si es la primera vez
        usernameCount[username] = (usernameCount[username] || 0) + 1;
      });

      console.log(usernameCount);

      const sortedEntries = Object.entries(usernameCount).sort(
        ([, a], [, b]) => b - a
      );

      const chunkedResults = [];
      for (let i = 0; i < sortedEntries.length; i += usersPerPage) {
        chunkedResults.push(sortedEntries.slice(i, i + usersPerPage));
      }

      const embeds = [];
      chunkedResults.forEach((chunk, chunkIndex) => {
        const formattedResults = chunk.map(
          ([username, count], index) =>
            `**${index + 1 + chunkIndex * usersPerPage}** | ${username} · **${count}**`
        );

        const embed = new EmbedBuilder()
          .setAuthor({ name: `LEADERBOARD` })
          .setColor("f54040")
          .setDescription("<:next:901832288378187816> Top Owned Padorus in server <:next:901832288378187816>")
          .setThumbnail('https://nerobotfiles.s3.eu-west-3.amazonaws.com/uploads/135/135.png')
          .addFields({
            name: "\u200B",
            value: formattedResults.join("\n"),
          });

        embeds.push(embed);
      });

      if (embeds.length <= 1) {
        await interaction.editReply({
          embeds: [embeds[0]],
        });
        return;
      }

      pagination.buttonPages(interaction, embeds);

      return;
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

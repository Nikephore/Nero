const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const { SlashCommandBuilder } = require("discord.js");
const math = require("../../functions/math");
const guild = require("../../schemas/guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buypadoru")
    .setDescription(`Buy a Padoru that you don't have`)
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

      const rarityValues = [0, 15, 30, 60, 100, 150, -1];

      // First of all we defer reply
      await interaction.deferReply();

      if (id <= 0 || id > length) {
        await interaction.editReply({
          content: `Select a number between 1 and ${length}`,
          ephemeral: true,
        });
        return;
      }

      const padoru = await dbpadoru.pick(id);
      const totalTickets = rarityValues[padoru.rarity];
      if (totalTickets > profile.resources.tickets) {
        await interaction.editReply({
          content: `You need **${
            totalTickets - profile.resources.tickets
          }** 🎟️ more to buy **${padoru.title}**`,
          ephemeral: true,
        });
        return;
      }

      if (totalTickets < 0) {
        await interaction.editReply({
          content: `You can't buy **${padoru.title}** because is a 6 star Padoru`,
          ephemeral: true,
        });
        return;
      }

      const index = profile.padorupedia.map((p) => p.id).indexOf(id);
      if (index !== -1) {
        await interaction.editReply({
          content: `You already have **${padoru.title}** unlocked`,
          ephemeral: true,
        });
        return;
      }

      const nPadoru = [id];
      await dbprofile.newPadorus(
        interaction.user.id,
        nPadoru,
        interaction.guild
      );
      await dbprofile.addTicket(
        interaction.user,
        -totalTickets,
        interaction.guild
      );

      await interaction.editReply(
        `You bought **${padoru.title}** for **${totalTickets}** 🎟️`
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

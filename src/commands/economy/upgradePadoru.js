const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  category: "economy",
  data: new SlashCommandBuilder()
    .setName("upgradepadoru")
    .setDescription(
      "Upgrade the rarity of your Padoru and obtain more coins each time you roll it"
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

      const rarityValues = [0, 5, 7, 10, 15, 25, 100];

      if (id <= 0 || id > length) {
        await interaction.reply({
          content: `Select a number between 1 and ${length}`,
          ephemeral: true,
        });
        return;
      }

      const padoru = await dbpadoru.pick(id);
      console.log(padoru);
      const totalTickets = rarityValues[padoru.rarity];

      if (totalTickets < 0) {
        await interaction.reply({
          content: `You can't upgrade **${padoru.title}** because is a 6 star Padoru`,
          ephemeral: true,
        });
        return;
      }

      const index = profile.padorupedia.map((p) => p.id).indexOf(id);
      console.log(index);
      if (index === -1) {
        await interaction.reply({
          content: `You don't have **${padoru.title}** unlocked`,
          ephemeral: true,
        });
        return;
      }

      if (profile.padorupedia[index].rarity === 1) {
        await interaction.reply({
          content: `This Padoru is already upgraded`,
          ephemeral: true,
        });
        return;
      }

      if (totalTickets > profile.resources.tickets) {
        await interaction.reply({
          content: `You need **${
            totalTickets - profile.resources.tickets
          }** 🎟️ more to exchange **${padoru.title}**`,
          ephemeral: true,
        });
        return;
      }

      await dbprofile.upgradePadoru(interaction.user, id, interaction.guild);
      await dbprofile.addTicket(
        interaction.user,
        -totalTickets,
        interaction.guild
      );

      await interaction.reply(
        `You have upgraded **${padoru.title}** for **${totalTickets}** 🎟️`
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

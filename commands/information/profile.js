const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const filter = require("../../functions/filter");

module.exports = {
  category: "information",
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Command to see a profile")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to see profile")
    ),
  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user") ?? interaction.user;

      let profile = await dbprofile.getProfile(user, interaction.guild);
      console.log("Antes de find", profile);
      voteRolls = profile.voteRolls;
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const plength = await dbpadoru.getLength();

      if (profile === undefined) {
        await interaction.reply({
          content: "This user does not exist",
          ephemeral: true,
        });
        return;
      }

      let luck = (1 / profile.skills.problucky.prob) * 100;
      let syba = "- Locked · ❌";
      if (profile.skills.gachamaster) {
        syba = "- Unlocked · ✅";
      }

      const message = new EmbedBuilder()
        .setAuthor({ name: user.username })
        .setColor(profile.colors.profile)
        .setThumbnail(profile.favpadoru)
        .addFields(
          {
            name: "\u200B",
            value: `**Padorupedia:** ${
              profile.padorupedia.length
            }/${plength}\n**Upgraded Padorus:** ${
              profile.padorupedia.filter((p) => p.rarity === 1).length
            }/${plength}`,
          },
          {
            name: "---**SKILLS**---",
            value: `**Rolls LV ${
              profile.skills.prolls.level
            }**\n- Number of rolls · ${
              profile.skills.prolls.numrolls
            }\n**Lucky Strike LV ${
              profile.skills.problucky.level
            }**\n- Probability · ${luck.toFixed(2)}%\n**Daily Coins LV ${
              profile.skills.dailycoins.level
            }**\n- Number of coins · ${
              profile.skills.dailycoins.dc
            }\n**Attack LV ${profile.skills.attack.level}**\n- Damage · ${
              profile.skills.attack.value
            } :heart:\n**Gacha Master Mode**\n${syba}`,
          },
          {
            name: "---**RESOURCES**---",
            value: `**PadoruCoins** ${filter.nFormatter(
              profile.resources.padoruCoins
            )} <:padorucoin:1187209585380048936>\n**Tickets** · ${profile.resources.tickets} 🎟️`,
          },
          {
            name: "---**CONSUMABLES**---",
            value: `**VoteRolls** · ${filter.nFormatter(voteRolls)}`,
          }
        );

      await interaction.reply({ embeds: [message] });
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

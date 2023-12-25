const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const filter = require("../../functions/filter");
const axios = require('axios');

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
      let voteRolls = profile.voteRolls;
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
      let syba = "Locked · ❌";
      if (profile.skills.gachamaster) {
        syba = "Unlocked · ✅";
      }
      const timestamp = new Date().getTime();

      let exhibitor = `https://nerobotfiles.s3.eu-west-3.amazonaws.com/exhibitors/${user.id}.jpg?timestamp=${timestamp}`;
      try {
        await axios.head(exhibitor);
      
      } catch (error) {
        exhibitor = `https://nerobotfiles.s3.eu-west-3.amazonaws.com/exhibitors/default.jpg?timestamp=${timestamp}`;
      }

      const message = new EmbedBuilder()
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setColor(profile.colors.profile)
        .setThumbnail(`https://nerobotfiles.s3.eu-west-3.amazonaws.com/uploads/1/1.png`)
        .setImage(exhibitor)
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
            name: "---------**SKILLS**---------",
            value: 'Can be upgraded at the /shop',
          },
          {
            name: `**Rolls\nLV ${profile.skills.prolls.level}**`,
            value: `**${profile.skills.prolls.numrolls}** Roll / 2H`,
            inline: true,
          },
          {
            name: `**Lucky Roll\nLV ${profile.skills.problucky.level}**`,
            value: `Probability · **${luck.toFixed(2)}**%`,
            inline: true,
          },
          {
            name: `**Daily Coins\nLV ${profile.skills.dailycoins.level}**`,
            value: `+ **${profile.skills.dailycoins.dc}** <:padorucoin2:1187212082735747143> / day\n+ **${profile.skills.dailycoins.level}** :tickets: / day`,
            inline: true,
          },
          {
            name: `**Attack\nLV ${profile.skills.attack.level}**`,
            value: `Damage · **${profile.skills.attack.value}** :heart:`,
            inline: true,
          },
          {
            name: '**Gacha Master Mode**',
            value: `${syba}`,
            inline: true,
          },
          {
            name: "---------**RESOURCES**---------",
            value: `**PadoruCoins** ${filter.nFormatter(
              profile.resources.padoruCoins
            )} <:padorucoin2:1187212082735747143>\n**Tickets** · ${
              profile.resources.tickets
            } 🎟️`,
          },
          {
            name: "---------**CONSUMABLES**---------",
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

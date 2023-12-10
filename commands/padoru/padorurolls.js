const dbprofile = require("../../databaseFunctions/dbProfile");
const dbpadoru = require("../../databaseFunctions/dbPadoru");
const dbguild = require("../../databaseFunctions/dbGuild");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const math = require("../../functions/math");
const Duration = require("humanize-duration");
const pagination = require("../../functions/pagination");

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName("voterolls")
    .setDescription("Use the rolls obtained through voting")
    .addNumberOption((option) =>
      option
        .setName("numberrolls")
        .setDescription("Number of Padorus to roll. Max 10")
    ),
  async execute(interaction) {
    try {
      const rarity = { 1: 0.39, 2: 0.3, 3: 0.2, 4: 0.1, 5: 0.01 };
      const sybariterarity = { 2: 0.5, 3: 0.32, 4: 0.15, 5: 0.03 };
      const coins = [50, 150, 450, 1500, 3000, 15000];
      const colors = [
        "",
        "f54040",
        "2cbf2e",
        "2ea0d1",
        "9f2ae8",
        "f2e01d",
        "ffffff",
      ];
      let myCoins = 0;

      let guild = await dbguild.getGuild(interaction.guild);
      let profile = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      let voteRolls = profile.voteRolls;
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);

      const rolls = interaction.options.getNumber("numberrolls") ?? 1;

      let remaining = Duration(math.normalizeDate(2, 2) * 60000, {
        units: ["h", "m"],
        maxDecimalPoints: 0,
        language: "en",
      });

      // First of all we defer reply
      await interaction.deferReply();

      if (isNaN(rolls) || rolls <= 0) {
        await interaction.editReply({
          content: `Select a valid number`,
          ephemeral: true,
        });
        return;
      }

      if (voteRolls < rolls) {
        await interaction.editReply({
          content: `You have ${voteRolls} rolls`,
          ephemeral: true,
        });
        return;
      }

      if (rolls > 10) {
        await interaction.editReply({
          content: `You can only roll 10 Padorus each time`,
          ephemeral: true,
        });
        return;
      }

      const raritiesArray = [];
      for (i = 0; i < rolls; i++) {
        raritiesArray.push(
          parseInt(
            math.weightedRandom(
              profile.skills.sybarite ? sybariterarity : rarity
            )
          )
        );
      }

      const selectedPadorus = await dbpadoru.pickPadorus(raritiesArray);

      dbprofile.addVoteRoll(interaction.user, -rolls);

      const myPadorus = profile.padorupedia;

      const newPadorusArray = [];
      const padoruIds = [];
      const embedsArray = [];

      for (const padoru of selectedPadorus) {
        await addPadoru(padoru);
      }

      async function addPadoru(padoru) {
        let isNew = "";
        // Comprobamos si el usuario tiene el padoru o no
        if (
          !myPadorus.some((p) => p.id === padoru.id) &&
          !newPadorusArray.includes(padoru.id)
        ) {
          isNew = "[ 🇳 🇪 🇼 ]";
          newPadorusArray.push(padoru.id);
        } else {
          isNew = `${coins[padoru.rarity]} PC`;
          myCoins += coins[padoru.rarity];
        }

        let guildPadoru = guild.padorupedia.find((p) => p.id === padoru.id);

        padoruIds.push(padoru.id);

        let attack = 0;
        let life = 0;
        if (guildPadoru.owner.userId === interaction.user.id) {
          await dbguild.attack(padoru.id, 0.5);
          attackText = `This Padoru is already yours. It restores some health points`;
          life = guildPadoru.life + 0.5;
        } else {
          if (profile.skills.attack.value >= guildPadoru.life) {
            await dbpadoru.attackFull(
              interaction.guild,
              padoru.id,
              interaction.user.id,
              interaction.user.username,
              padoru.rarity * 2
            );
            attackText = `${interaction.user.username} ⚔️⚔️ ${guildPadoru.owner.username}  is defeated. You own now this Padoru`;
            life = padoru.rarity * 2;
          } else {
            await dbguild.attack(
              interaction.guild,
              padoru.id,
              -profile.skills.attack.value
            );
            life = guildPadoru.life - profile.skills.attack.value;
            attackText = `${interaction.user.username} ⚔️🛡️ ${guildPadoru.owner.username}  defends the Padoru`;
          }
        }

        let title = math.rarityConvertEmoji(padoru.rarity);

        const embed = new EmbedBuilder()
          .setAuthor({ name: `#${padoru.id} ${padoru.title}    ${isNew}` })
          .setTitle(title)
          .setDescription(padoru.description)
          .setImage(padoru.image)
          .setColor(colors[padoru.rarity])
          .setFooter({
            text: `Roll number ${
              embedsArray.length + 1
            }\t/vote to obtain more rolls`,
          })
          .addFields(
            {
              name: "Artist",
              value: `${padoru.artist}`,
            },
            {
              name: "Attack",
              value: attackText,
            },
            {
              name: "Life",
              value: math.lifeConvertEmoji(life),
            }
          );

        embedsArray.push(embed);
      }

      await dbprofile.addCoins(interaction.user, myCoins, interaction.guild);
      await dbprofile.newPadorus(
        interaction.user.id,
        newPadorusArray,
        interaction.guild
      );
      await dbprofile.incTimesClaimed(
        interaction.user.id,
        padoruIds,
        interaction.guild
      );
      if (embedsArray.length === 1) {
        await interaction.editReply({ embeds: [embedsArray[0]] });
        return;
      }

      const newPadorusArrayCopy = newPadorusArray;
      const padoruTitles = selectedPadorus.map(
        (p) =>
          p.title +
          "\t" +
          math.rarityConvertAscii(p.rarity) +
          "\t" +
          (newPadorusArrayCopy.includes(p.id)
            ? (newPadorusArrayCopy.splice(newPadorusArrayCopy.indexOf(p.id), 1),
              "**NEW**")
            : " ")
      );

      const embed = new EmbedBuilder()
        .setAuthor({ name: `SUMMARY` })
        .setColor("f54040")
        .addFields(
          {
            name: "Rolls",
            value: padoruTitles.join("\n"),
          },
          {
            name: "Coins",
            value: `+${myCoins} :coin:`,
          }
        );

      embedsArray.push(embed);

      pagination.buttonPages(interaction, embedsArray);
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

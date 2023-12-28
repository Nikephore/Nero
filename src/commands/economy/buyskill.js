const fs = require("fs");
const path = require("path");
const dbprofile = require("../../databaseFunctions/dbProfile");
const {
  ActionRowBuilder,
  ComponentType,
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const filter = require("../../functions/filter");

module.exports = {
  category: "economy",
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy upgrades for your skills")
    .addStringOption((option) =>
      option
        .setName("skill")
        .setDescription("Skill to upgrade")
        .setRequired(true)
        .addChoices(
          { name: "padoru rolls", value: "prolls" },
          { name: "lucky probability", value: "problucky" },
          { name: "daily coins", value: "dailycoins" },
          { name: "attack", value: "attack" },
          { name: "gacha master mode", value: "gachamaster" }
        )
    ),

  async execute(interaction) {
    try {
      let profile = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const jsonPath = path.join(__dirname, "../../json/skilltree.json")
      const jsonString = fs.readFileSync(jsonPath);
      const coins = profile.resources.padoruCoins;
      const mySkills = profile.skills;
      const skills = JSON.parse(jsonString);
      let skill = [];

      for (let i in skills) {
        skill.push(skills[i]);
      }

      const buyOption = interaction.options.getString("skill");
      const confirm = new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success);

      const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(cancel, confirm);

      if (mySkills[buyOption].level >= skills[buyOption].maxlv) {
        await interaction.reply({
          content: `${skills[buyOption].name} is at the maximum level`,
          ephemeral: true,
        });
        return;
      }

      if (skills[buyOption].price[mySkills[buyOption].level] > coins) {
        await interaction.editReply({
          content: `You need ${filter.nFormatter(
            skills[buyOption].price[mySkills[buyOption].level] - coins
          )} <:padorucoin2:1187212082735747143> more to upgrade ${skills[buyOption].name} `,
          ephemeral: true,
        });
        return;
      }

      await interaction.deferReply({ ephemeral: true });

      const upgradeTexts = {
        "Padoru Rolls": `Number of Rolls | ${
          mySkills[buyOption].numrolls
        } <a:RightArrow:1183012509905588254> ${
          mySkills[buyOption].numrolls + 1
        }`,
        "Lucky Strike": `Probability of a Lucky Roll | ${(
          (1 / mySkills[buyOption].prob) *
          100
        ).toFixed(2)}% <a:RightArrow:1183012509905588254> ${(
          (1 / (mySkills[buyOption].prob - 3)) *
          100
        ).toFixed(2)}%`,
        "Daily Coins": `Coins per day | ${
          mySkills[buyOption].dc
        } <a:RightArrow:1183012509905588254> ${mySkills[buyOption].dc * 2}`,
        Attack: `Attack value | ${
          mySkills[buyOption].value
        } <a:RightArrow:1183012509905588254> ${
          mySkills[buyOption].value + 0.5
        }`,
        "Gacha Master Mode": `Gacha Master Mode | **Locked** <a:RightArrow:1183012509905588254> **Unlocked**`,
      };

      const msg = await interaction.editReply({
        content: `**Upgrade ${skills[buyOption].name}${
          mySkills[buyOption].level
            ? ` to LV ${mySkills[buyOption].level + 1}?`
            : "?"
        }** 
          \n${
            upgradeTexts[skills[buyOption].name]
          }\nPrice | ${filter.nFormatter(
          skills[buyOption].price[mySkills[buyOption].level]
        )} <:padorucoin2:1187212082735747143>`,
        ephemeral: true,
        components: [row],
        fetchReply: true,
      });

      const collector = await msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15000,
      });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.editReply({
            content: "You can't use these buttons",
            ephemeral: true,
          });
        }

        await i.deferUpdate();

        if (i.customId === "confirm") {
          await dbprofile.addCoins(
            i.user,
            -skills[buyOption].price[mySkills[buyOption].level],
            interaction.guild
          );
          await dbprofile.skillLvUp(i.user, buyOption, interaction.guild);
          return i.editReply({
            content: "Skill upgraded",
            ephemeral: true,
            components: [],
          });
        } else if (i.customId === "cancel") {
          return i.editReply({
            content: "Skill upgrade cancelled",
            ephemeral: true,
            components: [],
          });
        }
      });

      collector.on("end", async () => {});
    } catch (err) {
      console.log("Error ocurred: ", err.message);

      await interaction.followUp({
        content: "Oops! An error occurred while processing your command.",
        ephemeral: true,
      });
    }
  },
};

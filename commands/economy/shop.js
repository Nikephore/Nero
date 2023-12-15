const fs = require("fs");
const dbprofile = require("../../databaseFunctions/dbProfile");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const filter = require("../../functions/filter");

module.exports = {
  category: "economy",
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Shop to buy upgrades to your profile using Coins"),

  async execute(interaction) {
    try {
      let profile = await dbprofile.getProfile(
        interaction.user,
        interaction.guild
      );
      profile = profile.guilds.find((g) => g.id === interaction.guild.id);
      const jsonString = fs.readFileSync("./json/skilltree.json");
      const coins = profile.resources.padoruCoins;
      const mySkills = profile.skills;
      const skills = JSON.parse(jsonString);
      var skill = [];

      for (var i in skills) {
        skill.push(skills[i]);
      }

      const embed = new EmbedBuilder()
        .setAuthor({ name: `🏛️ Skills Shop` })
        .setTitle(`Your Coins: ${filter.nFormatter(coins)} :coin:`)
        .setColor("2cbf2e")
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/901798915425321000/901799488111403018/PADORUGOLD.png"
        )
        .setDescription(`To upgrade your skills use the command /buy`)
        .addFields(
          {
            name: "Skills",
            value: `- **Rolls LV · ${mySkills.prolls.level}**
                        \n${
                          mySkills.prolls.level !== skills.prolls.maxlv
                            ? "Next level: " +
                              filter.nFormatter(
                                skills.prolls.price[mySkills.prolls.level]
                              ) +
                              " :coin:"
                            : "Max level reached!"
                        }
                        \n- **Lucky Strike LV · ${mySkills.problucky.level}**
                        \n${
                          mySkills.problucky.level !== skills.problucky.maxlv
                            ? "Next level: " +
                              filter.nFormatter(
                                skills.problucky.price[mySkills.problucky.level]
                              ) +
                              " :coin:"
                            : "Max level reached!"
                        }
                        \n- **Daily Coins LV · ${mySkills.dailycoins.level}**
                        \n${
                          mySkills.dailycoins.level !== skills.dailycoins.maxlv
                            ? "Next level: " +
                              filter.nFormatter(
                                skills.dailycoins.price[
                                  mySkills.dailycoins.level
                                ]
                              ) +
                              " :coin:"
                            : "Max level reached!"
                        }
                        \n- **Attack LV · ${mySkills.attack.level}**
                        \n${
                          mySkills.attack.level !== skills.attack.maxlv
                            ? "Next level: " +
                              filter.nFormatter(
                                skills.attack.price[mySkills.attack.level]
                              ) +
                              " :coin:"
                            : "Max level reached!"
                        }`,
          },
          {
            name: `Gacha Master Mode ${
              mySkills.gachamaster
                ? "Unlocked"
                : "Locked · " +
                  filter.nFormatter(skills.gachamaster.price) +
                  ":coin: to unlock"
            }`,
            value: "\u200B",
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

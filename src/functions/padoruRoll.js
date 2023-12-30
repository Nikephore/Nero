const dbprofile = require("../databaseFunctions/dbProfile");
const dbpadoru = require("../databaseFunctions/dbPadoru");
const dbguild = require("../databaseFunctions/dbGuild");
const { EmbedBuilder } = require("discord.js");
const math = require("./math");
const Duration = require("humanize-duration");
const pagination = require("./pagination");
const padorugif = require("./padorugif");
const { rarityColorArray } = require ('../variables/colors');

async function padoruRoll(interaction, isVote) {
  try {
    // console.time("Claiming Padoru");
    const rarity = { 1: 0.39, 2: 0.3, 3: 0.2, 4: 0.1, 5: 0.01 };
    //const rarity = { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 };
    const gachararity = { 1: 0.25, 2: 0.32, 3: 0.25, 4: 0.15, 5: 0.03 };
    const upgradeValues = [0, 5, 7, 10, 15, 25, 100];
    const coins = [50, 150, 450, 1500, 3000, 15000];
    const timestamp = new Date().getTime();
    const { client } = interaction;
    const upgradeCommand = client.commands.find(
      (command) => command.data.name === "upgradepadoru"
    );
    const ticketinfo = client.commands.find(
      (command) => command.data.name === "ticketinfo"
    );

    // First of all we defer reply
    await interaction.deferReply();

    let myCoins = 0;
    let guild = await dbguild.getGuild(interaction.guild);
    if (guild === undefined) {
      await interaction.editReply({
        content: `Error rolling Padoru`,
        ephemeral: true,
      });
      return;
    }
    let profile = await dbprofile.getProfile(
      interaction.user,
      interaction.guild
    );

    profile = profile.guilds.find((g) => g.id === interaction.guild.id);
    const rolls = interaction.options.getInteger("numberrolls") ?? 1;

    let remaining = Duration(math.normalizeDate(2, 2) * 60000, {
      units: ["h", "m", "s"],
      maxDecimalPoints: 0,
      language: "en",
    });

    if (isNaN(rolls) || rolls <= 0) {
      await interaction.editReply({
        content: `Select a valid number`,
        ephemeral: true,
      });
      return;
    }

    if (!isVote) {
      if (
        profile.consumables.padorurolls < rolls &&
        profile.consumables.padorurolls > 0
      ) {
        await interaction.editReply({
          content: `You only have ${profile.consumables.padorurolls} rolls`,
          ephemeral: true,
        });
        return;
      }
    }

    if (isVote) {
      if (profile.voteRolls < rolls) {
        await interaction.editReply({
          content: `You have ${profile.voteRolls} rolls`,
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
    }

    if (profile.consumables.padorurolls <= 0) {
      await interaction.editReply({
        content: `Your next roll is in **${remaining}**. You can vote Nero to obtain more rolls with **/vote**`,
        ephemeral: false,
      });
      return;
    }

    const raritiesArray = [];
    const luckyArray = [];
    let maxrar = 1;
    for (let i = 0; i < rolls; i++) {
      let rollrar = parseInt(
        math.weightedRandom(profile.skills.gachamaster ? gachararity : rarity)
      );
      if (rollrar > maxrar) maxrar = rollrar;
      raritiesArray.push(rollrar);
      if (math.luckyStrike(profile.skills.problucky.prob)) {
        let rarityPlus = raritiesArray.slice(-1);
        rarityPlus++;
        luckyArray.push(rarityPlus);
      }
    }
    let selectedPadorus = await dbpadoru.pickPadorus(raritiesArray);
    let luckyPadorus = await dbpadoru.pickPadorus(luckyArray);

    isVote
      ? await dbprofile.removeVoteRoll(interaction.user, -rolls)
      : await dbprofile.addRoll(interaction.user, -rolls, interaction.guild);

    const myPadorus = profile.padorupedia;

    const newPadorusArray = [];
    const padoruIds = [];
    const embedsArray = [];
    let addPadoru;

    addPadoru = async function addPadoru(padoru, lucky) {
      let isNew = "";
      let profilePadoru = myPadorus.find((p) => p.id === padoru.id);
      padoru.upgraded = profilePadoru === undefined ? 0 : profilePadoru.rarity;
      // Comprobamos si el usuario tiene el padoru o no
      if (profilePadoru === undefined && !newPadorusArray.includes(padoru.id)) {
        isNew = "[ 🇳 🇪 🇼 ]";
        newPadorusArray.push(padoru.id);
      } else {
        isNew = `${coins[padoru.rarity + padoru.upgraded]} 🪙`;
        myCoins += coins[padoru.rarity + padoru.upgraded];
      }

      let guildPadoru = guild.padorupedia.find((p) => p.id === padoru.id);

      padoruIds.push(padoru.id);

      let attackText;
      let life = 0;
      let newLife = 0;
      let lifeText;
      if (guildPadoru.owner.userId === interaction.user.id) {
        await dbguild.attack(interaction.guild, padoru.id, 0.5);

        life = guildPadoru.life;
        if (guildPadoru.life < 10) {
          attackText =
            "<:Heal:1190327805939044483> This Padoru is already yours. It restores some health points <:Heal:1190327805939044483>";
          newLife = guildPadoru.life + 0.5;
          lifeText = "Heal +0.5 <:Health_Potion:1190296908741214359>";
        } else {
          attackText =
            "<:Heal:1190327805939044483> This Padoru is at max life <:Heal:1190327805939044483>";
          newLife = guildPadoru.life;
          lifeText = "Heal +0 <:Health_Potion:1190296908741214359>";
        }
      } else {
        if (profile.skills.attack.value >= guildPadoru.life) {
          await dbguild.attackFull(
            interaction.guild,
            padoru.id,
            interaction.user.id,
            interaction.user.username,
            padoru.rarity * 2
          );
          attackText = `**<:Sword:1190329403012546630> ${interaction.user.username}** <:VS:1190326293632385074> **${guildPadoru.owner.username}** <:Shield:1190329320980348928>\n <:Sword:1190329403012546630> **${interaction.user.username}** lands the final blow!!\n`;
          life = guildPadoru.life;
          newLife = padoru.rarity * 2;
          lifeText = `+${profile.skills.attack.value} DMG 💥💥`;
        } else {
          await dbguild.attack(
            interaction.guild,
            padoru.id,
            -profile.skills.attack.value
          );
          life = guildPadoru.life;
          newLife = guildPadoru.life - profile.skills.attack.value;
          lifeText = `+${profile.skills.attack.value} DMG 💥`;
          attackText = `**<:Sword:1190329403012546630> ${interaction.user.username}** <:VS:1190326293632385074> **${guildPadoru.owner.username}** <:Shield:1190329320980348928>\n <:Shield:1190329320980348928> **${guildPadoru.owner.username}** endures the hit!!`;
        }
      }

      let title = math.rarityConvertEmoji(padoru.rarity, padoru.upgraded);
      if (lucky) {
        title = title.concat("\t\t🍀LUCKY ROLL🍀");
      }

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `#${padoru.id} ${padoru.title}    ${isNew}`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setTitle(title)
        .setDescription(padoru.description)
        .setImage(`${padoru.image}?timestamp=${timestamp}`)
        .setColor(rarityColorArray[padoru.rarity])
        .setFooter({
          text: `Roll number ${
            embedsArray.length + 1
          }\t/vote to obtain more rolls`,
        })
        .addFields(
          {
            name: "Artist",
            value: `[Link to artist page](${padoru.artist})`,
          },
          {
            name: "Attack",
            value: attackText,
          },
          {
            name: "Life",
            value: `${math.lifeConvertEmoji(
              life
            )} ${lifeText} <:YellowRight:1190303499309821992>  ${math.lifeConvertEmoji(
              newLife
            )}`,
          },
          {
            name: `</${upgradeCommand.data.name}:${upgradeCommand.id}> ${
              padoru.title
            } with ${upgradeValues[padoru.rarity]} :tickets:`,
            value: `</${ticketinfo.data.name}:${ticketinfo.id}>`,
          }
        );

      embedsArray.push(embed);
    };

    for (const padoru of selectedPadorus) {
      await addPadoru(padoru, false);
    }

    if (luckyPadorus.length !== 0) {
      for (const padoru of luckyPadorus) {
        await addPadoru(padoru, true);
      }
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

    const newPadorusArrayCopy = newPadorusArray;
    const padoruTitles = selectedPadorus
      .map(
        (p) =>
          p.title +
          "\t" +
          math.rarityConvertAscii(p.rarity, p.upgraded) +
          "\t" +
          (newPadorusArrayCopy.includes(p.id)
            ? (newPadorusArrayCopy.splice(newPadorusArrayCopy.indexOf(p.id), 1),
              "**NEW**")
            : " ")
      )
      .concat(
        luckyPadorus.map(
          (p) =>
            p.title +
            "\t" +
            math.rarityConvertAscii(p.rarity, p.upgraded) +
            "\t" +
            (newPadorusArrayCopy.includes(p.id)
              ? (newPadorusArrayCopy.splice(
                  newPadorusArrayCopy.indexOf(p.id),
                  1
                ),
                "**NEW**")
              : " ") +
            "\t🍀"
        )
      );

    if (padoruTitles.length > 1) {
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
            value: `+${myCoins} <:padorucoin2:1187212082735747143>`,
          }
        );

      embedsArray.push(embed);
    }

    await padorugif.padorugif(interaction, maxrar);
    pagination.buttonPages(interaction, embedsArray);
  } catch (err) {
    console.log("Error ocurred: ", err.message);
    await interaction.followUp({
      content: "Oops! An error occurred while processing your command.",
      ephemeral: true,
    });
  }
}

module.exports = { padoruRoll };

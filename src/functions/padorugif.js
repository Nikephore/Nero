const { EmbedBuilder } = require("discord.js");

async function padorugif(interaction, rarity) {
  const gifs = [
    "",
    "https://imgur.com/xNECHMj.gif",
    "https://imgur.com/m5vGiZ1.gif.gif",
    "https://imgur.com/ZDUFTCF.gif",
    "https://imgur.com/iOJYa65.gif",
    "https://imgur.com/KEYqUzf.gif",
  ];
  // errors
  if (!interaction) throw new Error("Please provide an interaction argument");

  const wait = require("node:timers/promises").setTimeout;

  const embed = new EmbedBuilder().setColor("f54040").setImage(gifs[rarity]);

  await interaction.editReply({ embeds: [embed] });
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  await delay(4600);

  return;
}

module.exports = { padorugif };

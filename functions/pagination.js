const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  Client,
  GatewayIntentBits,
} = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// must defer reply before calling this function
async function buttonPages(interaction, pages, time = 60000) {
  try {
    // errors
    if (!interaction) throw new Error("Please provide an interaction argument");
    if (!pages) throw new Error("Please provide a page argument");
    if (!Array.isArray(pages)) throw new Error("Pages must be an array");

    if (typeof time !== "number") throw new Error("Time must be a number.");
    if (parseInt(time) < 30000)
      throw new Error("Time must be greater than 30 Seconds");

    // If only one page no buttons
    if (pages.length === 1) {
      await interaction.editReply({
        embeds: [pages[0]],
        components: [],
      });
      return;
    }

    //adding buttons
    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setEmoji("901832158304415765")
      .setStyle(ButtonStyle.Primary);

    const next = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji("901832288378187816")
      .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(prev, next);

    let index = 0;

    const currentPage = await interaction.editReply({
      embeds: [pages[index]],
      components: [buttonRow],
      fetchReply: true,
    });

    const collector = await currentPage.createMessageComponentCollector({
      ComponentType: ComponentType.Button,
      time,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: "You can't use these buttons",
          ephemeral: true,
        });
      }

      await i.deferUpdate();

      if (i.customId === "prev") {
        index = (index - 1 + pages.length) % pages.length;
      } else if (i.customId === "next") {
        index = (index + 1) % pages.length;
      }

      await currentPage.edit({
        embeds: [pages[index]],
        components: [buttonRow],
      });

      collector.resetTimer();
    });

    collector.on("end", async (i) => {
      const channel = interaction.channel;
      if (!channel) {
        return false; // El canal asociado a la interacción no existe
      }

      await currentPage.edit({
        embeds: [pages[index]],
        components: [],
      });
    });
    return currentPage;
  } catch (error) {
    console.log("Error ocurred: ", error.message);

    await interaction.followUp({
      content: "Oops! An error occurred while processing your command.",
      ephemeral: true, // Opcional: Hace que la respuesta solo sea visible para el usuario que ejecutó el comando
    });
  }
}

module.exports = { buttonPages };

const dbseries = require("../src/databaseFunctions/dbSeries");
const mongo = require("../mongo");

async function seriesFilter(interaction, padorupedia, mySeries, user) {
  const mongoSeries = await dbseries.getSeries(mySeries);
  console.log("length", mongoSeries.length);
  if (mongoSeries.length === 0) {
    console.log("error");
    await interaction.reply({
      content: `${user.username}, this series doesn't exists`,
    });
    return null;
  }
  // Filtra los elementos de padorupedia que contienen la serie dada en su array de series
  padorupedia = padorupedia.filter((item) => {
    return mongoSeries.some((mongoSeriesItem) => {
      const seriesName = mongoSeriesItem.name.toLowerCase();
      return (item.series || []).some(
        (itemSeries) => itemSeries.toLowerCase() === seriesName
      );
    });
  });

  return padorupedia;
}

async function sortByFlag(sort, padorupedia) {
  if (sort === "abc") {
    padorupedia.sort((a, b) => {
      const titleA = padorupedia.find((item) => item.id === a.id)?.title || "";
      const titleB = padorupedia.find((item) => item.id === b.id)?.title || "";
      return titleA.localeCompare(titleB);
    });
  } else if (sort === "rarity") {
    padorupedia.sort((a, b) => {
      const rarityA = padorupedia.find((item) => item.id === a.id)?.rarity || 0;
      const rarityB = padorupedia.find((item) => item.id === b.id)?.rarity || 0;
      return rarityA - rarityB;
    });
  }

  return padorupedia;
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

var SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];

function nFormatter(number) {
  // what tier? (determines SI symbol)
  var tier = (Math.log10(Math.abs(number)) / 3) | 0;

  // if zero, we don't need a suffix
  if (tier == 0) return number;

  // get suffix and determine scale
  var suffix = SI_SYMBOL[tier];
  var scale = Math.pow(10, tier * 3);

  // scale the number
  var scaled = number / scale;

  // format number and add suffix
  return scaled.toFixed(1) + suffix;
}

module.exports = {
  seriesFilter,
  sortByFlag,
  toTitleCase,
  nFormatter,
};

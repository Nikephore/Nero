function randomNumberBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function luckyStrike(num) {
  let lucky = Math.floor(Math.random() * num);

  // Probabilidad de 1/num de que devuelva true
  if (lucky === 1) {
    return true;
  }

  return false;
}

function weightedRandom(prob) {
  let i,
    sum = 0,
    r = Math.random();

  for (i in prob) {
    sum += prob[i];
    if (r <= sum) return i;
  }
}

function rarityConvertAscii(rarity, add = 0) {
  var ret = "";

  for (let i = 0; i < rarity; i++) {
    ret += "★";
  }

  for (let i = 0; i < add; i++) {
    ret += "☆";
  }

  return ret;
}

function rarityConvertEmoji(rarity, add = 0) {
  var ret = "";

  for (let i = 0; i < rarity; i++) {
    ret += ":star:";
  }

  for (let i = 0; i < add; i++) {
    ret += ":star2:";
  }

  return ret;
}

function lifeConvertEmoji(life) {
  var ret = "";

  for (let i = 1; i <= life; i++) {
    ret += "<:Heart:1190323706552127699>";
  }

  if (life % 1 !== 0) {
    ret += "<:Half_Heart:1190323541837615286>";
  }

  return ret;
}

function lifeConvertEmojiFooter(life) {
    var ret = "";
  
    for (let i = 1; i <= life; i++) {
      ret += "❤️";
    }
  
    if (life % 1 !== 0) {
      ret += "💔";
    }
  
    return ret;
  }

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function minsToMidnight() {
  var now = new Date();
  var then = new Date(now);
  then.setHours(24, 0, 0, 0);
  return (then - now) / 6e4;
}

function normalizeDate(step, add = 0) {
  let now = new Date();
  let hour = Math.floor(now.getHours() / step) * step + add;
  let then = new Date(now);
  then.setHours(hour, 0, 0, 0);

  return (then - now) / 6e4;
}

module.exports = {
  randomNumberBetween,
  luckyStrike,
  rarityConvertAscii,
  rarityConvertEmoji,
  lifeConvertEmoji,
  lifeConvertEmojiFooter,
  sleep,
  minsToMidnight,
  weightedRandom,
  normalizeDate,
};

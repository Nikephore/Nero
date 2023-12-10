const mongoose = require("mongoose");

const seriesSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  alias: {
    type: [String],
    default: [],
  },
  thumbnail: {
    type: String,
    default:
      "https://cdn.discordapp.com/attachments/901798915425321000/901799120740704276/PADORUorg.png",
  },
});

module.exports = mongoose.model("series", seriesSchema);

const mongoose = require("mongoose");

const padoruSchema = mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
  },
  artist: { type: String },
  banner: {
    type: Boolean,
    default: false,
  },
  color: { type: String },
  description: { type: String },
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  image: { type: String },
  life: {
    type: Number,
    default: 1,
    max: 10,
  },
  owner: {
    userId: {
      type: String,
      default: "442790194555650048",
    },
    username: {
      type: String,
      default: "Nero",
    },
  },
  rarity: {
    type: Number,
  },
  raritystar: {
    type: String,
  },
  released: {
    type: Boolean,
    default: true,
  },
  series: {
    type: [String],
    default: [],
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("padoru", padoruSchema);

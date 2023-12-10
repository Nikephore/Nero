const mongoose = require("mongoose");

const guildSchema = mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  padorupedia: {
    type: [
      {
        id: {
          type: Number,
        },
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
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("guild", guildSchema);

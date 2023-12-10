const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  voteRolls: {
    type: Number,
    default: 0,
  },
  guilds: {
    type: [
      {
        id: {
          type: String,
        },
        favpadoru: {
          type: String,
          default:
            "https://cdn.discordapp.com/attachments/901798915425321000/901799120740704276/PADORUorg.png",
        },
        resources: {
          padoruCoins: {
            type: Number,
            default: 0,
          },
          tickets: {
            type: Number,
            default: 0,
          },
        },
        colors: {
          profile: {
            type: String,
            default: "eb4034",
          },
          padorupedia: {
            type: String,
            default: "eb4034",
          },
        },
        skills: {
          prolls: {
            level: {
              type: Number,
              default: 1,
            },
            numrolls: {
              type: Number,
              default: 1,
            },
          },
          problucky: {
            level: {
              type: Number,
              default: 1,
            },
            prob: {
              type: Number,
              default: 25,
            },
          },
          dailycoins: {
            level: {
              type: Number,
              default: 1,
            },
            dc: {
              type: Number,
              default: 500,
            },
          },
          attack: {
            level: {
              type: Number,
              default: 1,
            },
            value: {
              type: Number,
              default: 0.5,
            },
          },
          gachamaster: {
            type: Boolean,
            default: false,
          },
        },
        consumables: {
          daily: {
            type: Boolean,
            default: true,
          },
          padorurolls: {
            type: Number,
            default: 1000,
          },
        },
        padorupedia: {
          type: [
            {
              id: {
                type: Number,
              },
              rarity: {
                type: Number,
                default: 0,
              },
              ascension: {
                type: Number,
                default: 0,
              },
              timesClaimed: {
                type: Number,
                default: 0,
              },
            },
          ],
          default: [],
        },
      },
    ],
    default: [],
  },
});

module.exports = mongoose.model("userProfile", profileSchema);

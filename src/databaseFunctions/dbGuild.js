const guildSchema = require("../schemas/guild");
const dbpadoru = require("./dbPadoru");

module.exports.getGuild = async (guild) => {
  try {
    let data = await guildSchema.findOne({ guildId: guild.id }).lean();

    if (!data) {
      data = await guildSchema.create({
        guildId: guild.id,
      });
      this.guildPopulate(guild);
    }

    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports.guildPopulate = async (guild) => {
  const padorus = await dbpadoru.getAll("id");

  for (const p of padorus) {
    await guildSchema.updateOne(
      { guildId: guild.id },
      {
        $push: {
          padorupedia: {
            id: p.id,
            life: p.rarity,
            owner: {
              userId: "442790194555650048",
              username: "Nero",
            },
          },
        },
      }
    );
  }
};

module.exports.guildAddPadoru = async (p) => {
  try {
    await guildSchema.updateMany(
      {},
      {
        $push: {
          padorupedia: {
            id: p.id,
            life: p.rarity,
            owner: {
              userId: "442790194555650048",
              username: "Nero",
            },
          },
        },
      }
    );

    return;
    
  } catch (err) {
    console.error(err);
  }
};

module.exports.attack = async (guild, pid, attack) => {
  try {
    const result = await guildSchema.findOneAndUpdate(
      { guildId: guild.id, "padorupedia.id": pid },
      {
        $inc: { "padorupedia.$.life": attack },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports.attackFull = async (guild, pid, userId, username, rar) => {
  try {
    const uid = userId.toString();
    const filter = { guildId: guild.id, "padorupedia.id": pid };
    const update = {
      $set: {
        "padorupedia.$.life": rar,
        "padorupedia.$.owner.userId": uid,
        "padorupedia.$.owner.username": username,
      },
    };
    const options = { upsert: true, new: true };

    const result = await guildSchema.findOneAndUpdate(filter, update, options);

    if (result) {
      console.log(`Life incremented for guildId: ${guild.id}, pid: ${pid}`);
    } else {
      console.log(
        `No matching document found for guildId: ${guild.id}, pid: ${pid}`
      );
    }
  } catch (err) {
    console.error(err);
  }
};

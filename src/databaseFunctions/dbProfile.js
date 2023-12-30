const profileSchema = require("../schemas/profile");

module.exports.dailyCoins = async (user, padoruCoins, tickets, guild) => {
  try {
    await profileSchema.findOneAndUpdate(
      { userId: user.id, "guilds.id": guild.id },
      {
        $inc: {
          "guilds.$.resources.padoruCoins": padoruCoins,
          "guilds.$.resources.tickets": tickets,
        },
        $set: {
          "guilds.$.consumables.daily": false,
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.upgradePadoru = async (user, pid, guild) => {
  try {
    await profileSchema.findOneAndUpdate(
      { userId: user.id, "guilds.id": guild.id, "guilds.padorupedia.id": pid },
      {
        $set: { "guilds.$[outer].padorupedia.$[inner].rarity": 1 },
      },
      {
        arrayFilters: [{ "outer.id": guild.id }, { "inner.id": pid }],
        upsert: true,
        new: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.ascendPadoru = async (user, pid, guild) => {
  try {
    if (pid.length === 0 || !user || !profileSchema || !guild) {
      return;
    }

    await profileSchema.findOneAndUpdate(
      { userId: user.id, "guilds.id": guild.id, "guilds.padorupedia.id": pid },
      {
        $inc: { "guilds.$[outer].padorupedia.$[inner].ascension": 1 },
      },
      {
        arrayFilters: [{ "outer.id": guild.id }, { "inner.id": pid }],
        upsert: true,
        new: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.newPadorus = async (userId, pid, guild) => {
  try {
    if (pid.length === 0 || !userId || !profileSchema) {
      return;
    }

    const updatePromises = pid.map(async (element) => {
      await profileSchema.findOneAndUpdate(
        { userId, "guilds.id": guild.id },
        {
          $push: { "guilds.$.padorupedia": { id: element } },
        },
        {
          upsert: true,
          new: true,
        }
      );
    });

    await Promise.all(updatePromises);

    const profile = await profileSchema.findOne({ userId });
    const guildProfile = profile.guilds.find((g) => g.id === guild.id);

    const sortedPadorupedia = guildProfile.padorupedia.sort(
      (a, b) => a.id - b.id
    );

    await profileSchema.findOneAndUpdate(
      { userId, "guilds.id": guild.id },
      { "guilds.$.padorupedia": sortedPadorupedia }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.incTimesClaimed = async (userId, pid, guild) => {
  try {
    if (pid.length === 0 || !userId || !profileSchema || !guild) {
      return;
    }

    const updatePromises = pid.map(async (element) => {
      await profileSchema.findOneAndUpdate(
        { userId, "guilds.id": guild.id, "guilds.padorupedia.id": element },
        {
          $inc: { "guilds.$.padorupedia.$[elem].timesClaimed": 1 },
        },
        {
          upsert: true,
          new: true,
          arrayFilters: [{ "elem.id": element }], // Filtramos por el id específico
        }
      );
    });

    await Promise.all(updatePromises);
  } catch (err) {
    console.error(err);
  }
};

module.exports.dumppp = async () => {
  try {
    await profileSchema.updateMany(
      {},
      [
        {
          $addFields: {
            pp: {
              $map: {
                input: "$padorupedia",
                as: "pad",
                in: {
                  id: "$$pad",
                  rarity: 0,
                },
              },
            },
          },
        },
      ],
      { multi: true }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.reset = async () => {
  try {
    await profileSchema.updateMany(
      {},
      [
        {
          $unset: ["padorupedia"],
        },
      ],
      { multi: true }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.resetDaily = async () => {
  try {
    await profileSchema.updateMany(
      {},
      {
        $set: { daily: 1 },
      },
      { multi: true }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.getProfile = async (user, guild) => {
  try {
    let data = await profileSchema.findOne({ userId: user.id });

    if (!data) {
      // If the document doesn't exist, create a new one
      data = await profileSchema.create({
        userId: user.id,
        username: user.username,
        guilds: [{ id: guild.id }],
      });
    } else if (!data.guilds.some((g) => g.id === guild.id)) {
      console.log("Guild doesn't exist");

      // If the guild doesn't exist, push it to the guilds array
      data = await profileSchema.findOneAndUpdate(
        { userId: user.id },
        { $push: { guilds: { id: guild.id } } },
        { new: true } // Return the modified document
      );
    }

    return data;
  } catch (err) {
    console.log(err);
  }
};

module.exports.getGuildProfile = async (user, guild) => {
  try {
    let data = await profileSchema.findOne({ userId: user.id });

    if (!data) {
      // If the document doesn't exist, create a new one
      data = await profileSchema.create({
        userId: user.id,
        username: user.username,
        guilds: [{ id: guild.id }],
      });
    } else if (!data.guilds.some((g) => g.id === guild.id)) {
      console.log("Guild doesn't exist");

      // If the guild doesn't exist, push it to the guilds array
      data = await profileSchema.findOneAndUpdate(
        { userId: user.id },
        { $push: { guilds: { id: guild.id } } },
        { new: true } // Return the modified document
      );
    }

    // Obtener el índice del perfil de la guild en el array
    const guildIndex = data.guilds.findIndex((g) => g.id === guild.id);

    // Obtener directamente el perfil de la guild usando el índice
    const guildProfile = guildIndex !== -1 ? data.guilds[guildIndex] : null;

    return guildProfile;
  } catch (err) {
    console.log(err);
  }
};

module.exports.setFavPadoru = async (user, tn, guild) => {
  try {
    await profileSchema.findOneAndUpdate(
      { userId: user.id, "guilds.id": guild.id },
      {
        $set: { "guilds.$.favpadoru": tn },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

/* Funciones para gestionar los rolls*/
module.exports.addRoll = async (user, number, guild) => {
  try {
    await profileSchema.findOneAndUpdate(
      { userId: user.id, "guilds.id": guild.id },
      {
        $inc: { "guilds.$.consumables.padorurolls": number },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports.removeVoteRoll = async (user, number) => {
  try {

    await profileSchema.findOneAndUpdate(
      { userId: user.id },
      {
        $inc: { voteRolls: number },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports.addVoteRoll = async (user, isWeekend) => {
  try {
    let number = isWeekend ? 2 : 1;
    console.log(number);
    console.log(user);
    await profileSchema.findOneAndUpdate(
      { userId: user },
      {
        $inc: { voteRolls: number },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return;
  } catch (err) {
    console.log(err);
  }
};

/* Funciones para gestionar los Tickets */
module.exports.addTicket = async (user, number, guild) => {
  console.log(number);
  try {
    await profileSchema.findOneAndUpdate(
      { userId: user.id, "guilds.id": guild.id },
      {
        $inc: { "guilds.$.resources.tickets": number },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.addCoins = async (user, padoruCoins, guild) => {
  try {
    await profileSchema.findOneAndUpdate(
      { userId: user.id, "guilds.id": guild.id },
      {
        $inc: { "guilds.$.resources.padoruCoins": padoruCoins },
      },
      {
        upsert: true,
        new: true,
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.skillLvUp = async (user, skill, guild) => {
  try {
    const filter = { userId: user.id, "guilds.id": guild.id };

    if (skill === "attack") {
      await profileSchema.findOneAndUpdate(filter, {
        $inc: {
          "guilds.$.skills.attack.level": 1,
          "guilds.$.skills.attack.value": 0.5,
        },
      });
    } else if (skill === "dailycoins") {
      await profileSchema.findOneAndUpdate(filter, {
        $inc: { "guilds.$.skills.dailycoins.level": 1 },
        $mul: { "guilds.$.skills.dailycoins.dc": 2 },
      });
    } else if (skill === "problucky") {
      await profileSchema.findOneAndUpdate(filter, {
        $inc: {
          "guilds.$.skills.problucky.level": 1,
          "guilds.$.skills.problucky.prob": -3,
        },
      });
    } else if (skill === "prolls") {
      await profileSchema.findOneAndUpdate(filter, {
        $inc: {
          "guilds.$.skills.prolls.level": 1,
          "guilds.$.skills.prolls.numrolls": 1,
        },
      });
    }

    return;
  } catch (err) {
    console.log(err);
  }
};

module.exports.pityFour = async (user, guild) => {
    const filter = { userId: user.id, "guilds.id": guild.id };

    // devuelve el pity de 4E a 0
    await profileSchema.findOneAndUpdate(filter, {
        $inc: {"guilds.$.pity.five": 1},
        $set: {"guilds.$.pity.four": 0}
      });
};

module.exports.pityFive = async (user, guild) => {
    const filter = { userId: user.id, "guilds.id": guild.id };

    // devuelve el pity de 5E a 0
    await profileSchema.findOneAndUpdate(filter, {
        $inc: {"guilds.$.pity.four": 1},
        $set: {"guilds.$.pity.five": 0}
      });
};

module.exports.addPity = async (user, guild, four, five) => {
    const filter = { userId: user.id, "guilds.id": guild.id };
    await profileSchema.findOneAndUpdate(filter, {
        $inc: {
          "guilds.$.pity.five": five,
          "guilds.$.pity.four": four,
        },
      });
};

module.exports.addToDocuments = async () => {
    
}

module.exports.delete = async (user) => {
  try {
    await profileSchema.deleteOne({ userId: user.id });

    return;
  } catch (err) {
    console.log(err);
  }
};

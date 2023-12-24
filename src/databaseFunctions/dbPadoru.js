const padoruSchema = require("../schemas/padoru");

module.exports.add = async (e) => {
  try {
    await padoruSchema.findOneAndUpdate(
      {
        id: e.id,
      },
      {
        id: e.id,
        title: e.title,
        rarity: e.rarity,
        series: e.series,
        active: e.active,
        banner: e.banner,
        released: e.released,
        description: e.description,
        color: e.color,
        artist: e.artist,
        image: e.image,
        life: e.rarity,
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

module.exports.removefield = async (e) => {
  try {
    await padoruSchema.updateMany(
      {}, // An empty filter matches all documents in the collection
      {
        $unset: {
          life: 1,
          owner: 1,
        },
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.pickPadorus = async (raritiesArray) => {
  try {
    const promises = raritiesArray.map(async (rarity) => {
      const result = await padoruSchema.aggregate([
        { $match: { rarity, active: true, released: true } },
        { $sample: { size: 1 } },
      ]);
      return result[0];
    });

    const results = await Promise.all(promises);

    return results;
  } catch (err) {
    console.log(err);
  }
};

module.exports.pick = async (pid) => {
  try {
    const result = await padoruSchema.findOne({ id: pid });

    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports.allOwners = async () => {
  try {
    const result = await padoruSchema.find({}, { owner: 1, _id: 0 });

    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports.getAll = async (sort) => {
  try {
    console.log(sort);
    let result;
    if (sort === "id") {
      result = await padoruSchema.find({ released: true }).sort({ id: 1 });
    } else if (sort === "abc") {
      result = await padoruSchema.find({ released: true }).sort({ title: 1 });
    } else if (sort === "rarity") {
      result = await padoruSchema.find({ released: true }).sort({ rarity: -1 });
    }

    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports.getLength = async () => {
  try {
    const result = await padoruSchema.find().count();

    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports.setActive = async (id, active) => {
  try {
    await padoruSchema.findOneAndUpdate(
      { id },
      { $set: { active }, },
      { upsert: true, new: true, }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports.setbanner = async (pid, bool) => {
  try {
    await padoruSchema.findOneAndUpdate(
      {
        id: pid,
      },
      {
        $set: {
          banner: bool,
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

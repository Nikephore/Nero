const seriesSchema = require("../schemas/series");

module.exports.getSeries = async (name) => {
  try {
    const result = await seriesSchema.find({
      alias: { $elemMatch: { $regex: new RegExp(name, "i") } },
    });
    console.log(result);
    return result;
  } catch (err) {
    console.log(err);
  }
};

module.exports.getAllSeries = async () => {
    try {
      const result = await seriesSchema.find({});
      return result;
    } catch (err) {
      console.log(err);
    }
  };

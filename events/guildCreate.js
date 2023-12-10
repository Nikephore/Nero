const { Events } = require("discord.js");
const dbguild = require("../databaseFunctions/dbGuild");

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    let newGuild = await dbguild.getGuild(guild);

    return;
  },
};

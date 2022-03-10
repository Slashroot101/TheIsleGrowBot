const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');
const { ClientBase } = require('pg');

module.exports = {
    name: eventTypes.steamLinked,
    handler: async (client, data) => {
        const guild = await client.guilds.fetch(guildId);
        const user = await guild.members.fetch(data.discordId);
        await user.roles.add(instanceRoles.get('registrationRole').id);
        await client.channels.cache.get(replyChannel).send(`<@${data.discordId}>, your steam account has successfully been linked!`);
    },
}
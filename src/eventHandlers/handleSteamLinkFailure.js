const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');

module.exports = {
    name: eventTypes.steamLinkedFailure,
    handler: async (client, data) => {
        await client.channels.cache.get(replyChannel).send(`<@${data.discordId}>, you need to link your steam account to your discord!`);
    },
}
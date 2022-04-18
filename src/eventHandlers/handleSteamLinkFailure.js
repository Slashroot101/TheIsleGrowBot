const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');
const logger = require('../lib/logger');

module.exports = {
    name: eventTypes.steamLinkedFailure,
    handler: async (client, data) => {
        logger.info(`Received event ${eventTypes.steamLinkedFailure} for user [userId=${data.discordId}]`);
        await client.channels.cache.get(replyChannel).send(`<@${data.discordId}>, you need to link your steam account to your discord!`);
    },
}
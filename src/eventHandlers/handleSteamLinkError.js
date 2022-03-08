const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');

module.exports = {
    name: eventTypes.steamLinkError,
    handler: async (client, data) => {
        await client.channels.cache.get(replyChannel).send(`An error occured while linking steam accounts! If you are trying to link, try again later.`);
    },
}
const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');

module.exports = {
    name: eventTypes.steamLinked,
    handler: async (client, data) => {
        console.log(data);
        await client.channels.cache.get(replyChannel).send(`<@${data.discordId}>, your steam account has successfully been linked!`);
    },
}
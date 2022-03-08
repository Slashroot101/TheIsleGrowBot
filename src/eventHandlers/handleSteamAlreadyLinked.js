const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');

module.exports = {
    name: eventTypes.steamAlreadyLinked,
    handler: async (client, data) => {
        console.log(data);
        await client.channels.cache.get(replyChannel).send(`<@${data.discordId}>, your steam account is already linked, either to your account or someone else!`);
    },
}
const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');
const {guildId} = require('../config');
const {instanceRoles} = require('../deploy-roles');
const logger = require('../lib/logger');
module.exports = {
    name: eventTypes.steamAlreadyLinked,
    handler: async (client, data) => {
        logger.info(`Received event ${eventTypes.steamAlreadyLinked} for user [userId=${data.discordId}]`);
        const guild = await client.guilds.fetch(guildId);
        const user = await guild.members.fetch(data.discordId);
        await user.roles.add(instanceRoles.get('registrationRole').id);
        await client.channels.cache.get(replyChannel).send(`<@${data.discordId}>, your steam account is already linked, either to your account or someone else!`);
    },
}
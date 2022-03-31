const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');
const {guildId} = require('../config');
const {instanceRoles} = require('../deploy-roles');
module.exports = {
    name: eventTypes.donationComplete,
    handler: async (client, data) => {
        const guild = await client.guilds.fetch(guildId);
        const user = await guild.members.fetch(data.discordId);
        await user.roles.add(instanceRoles.get('donator').id);
        await client.channels.cache.get(replyChannel).send(`<@${data.discordId}>, your donation has been received! Check your balance with /bal! Thank you for donating!`)
    },
}
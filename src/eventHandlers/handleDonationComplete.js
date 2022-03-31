const eventTypes = require('../eventTypes');
const {replyChannel} = require('../config');
const {guildId} = require('../config');
const {instanceRoles} = require('../deploy-roles');
module.exports = {
    name: eventTypes.donationComplete,
    handler: async (client, data) => {
    },
}
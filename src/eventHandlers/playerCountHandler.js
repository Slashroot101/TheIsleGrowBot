const {subMinutes} = require('date-fns');
const {scrapeInterval} = require('../config');
const eventTypes = require('../eventTypes');
const logger = require('../lib/logger');
module.exports = {
    name: eventTypes.playerCount,
    handler: async (client, data,) => {
      if(subMinutes(new Date(), data.sentDate) > scrapeInterval){
        return;
      }
      logger.info(`Received event ${eventTypes.playerCount} with ${data.numOnline} players`);
      await client.user.setActivity(`Dinosaurs Online: ${data.numOnline}`);
    },
}
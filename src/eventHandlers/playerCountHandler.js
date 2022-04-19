const {differenceInMinutes} = require('date-fns');
const {scrapeInterval} = require('../config');
const eventTypes = require('../eventTypes');
const logger = require('../lib/logger');
module.exports = {
    name: eventTypes.playerCount,
    handler: async (client, data,) => {
      if(differenceInMinutes(new Date(), data.sentDate) > scrapeInterval){
        return;
      }
      await client.user.setActivity(`Dinosaurs Online: ${data.numOnline}`);
    },
}
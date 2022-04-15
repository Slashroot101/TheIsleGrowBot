const {subMinutes} = require('date-fns');
const {scrapeInterval} = require('../config');
const eventTypes = require('../eventTypes');
module.exports = {
    name: eventTypes.playerCount,
    handler: async (client, data,) => {
      if(subMinutes(new Date(), data.sentDate) > scrapeInterval){
        return;
      }
      await client.user.setActivity(`Dinosaurs Online: ${data.numOnline}`);
    },
}
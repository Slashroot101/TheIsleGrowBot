const {scrapeInterval, playerDatabase, natsUrl} = require('../config');
const {DinoStats} = require('../model');
const eventTypes = require('../eventTypes');
const {readdir, stat, readFile} = require('fs').promises;
const {connect} = require('nats');
const {subMinutes} = require('date-fns');
(async () => {
  const nats = await connect({
    url: natsUrl,
  });
  setInterval(async () => {
    const dinoMap = new Map();
    const files = await (await readdir(`${playerDatabase}/Survival/Players/`)).filter(x => x.endsWith('.json'));
    let numOnline = 0;
    for(const file of files){
      const playerFile = `${playerDatabase}/Survival/Players/${file}`;
      const stats = await stat(playerFile);
      if (subMinutes(new Date().getTime(), stats.mtime.getTime()) <= 10) {
        numOnline++;
      }

      const {CharacterClass} = JSON.parse(await readFile(playerFile));
      const dino = dinoMap.get(CharacterClass)
      if(dino){
        dinoMap.set(CharacterClass, dino + 1);
      } else {
        dinoMap.set(CharacterClass, 1);
      }
    }
    let dinoArray = [];
    for(const dino of dinoMap) {
      const [dinoName, count] = dino;
      dinoArray.push({dinoName, count})
    }
    nats.publish(eventTypes.playerCount, Buffer.from(JSON.stringify({numOnline, sentDate: new Date()})));
    await DinoStats.bulkCreate(dinoArray, {
      updateOnDuplicate: ['dinoName', 'count'],
    })
  }, 1000 * 60 * scrapeInterval);
})();

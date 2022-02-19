const { resolve } = require('path');
const { readFile, writeFile, exists } = require('fs');

module.exports = class IslePlayerDatabase {
    databasePath = null;

    constructor(databasePath){
        if(!databasePath){
            throw new Error('Player database file path is required!');
        }

        databasePath = databasePath;
    }

    async doesPlayerFileExist(steamId){
        return new Promise((res, reject) => {
            exists(`${databasePath}/Survival/Players/${steamId}.json`, async (exists) => {
                res(exists);
            });
        });
    }

    async getPlayerSave(steamId){
        return new Promise((res, rej) => {
            readFile(`${databasePath}/Survival/Players/${steamId}.json`, async (err, data) => {
                if(err) rej(err);
                res(data);
            });
        });
    }

    async writePlayerSave(steamId, playerData){
        return new Promise((res, rej) => {
            writeFile(resolve(`${databasePath}/Survival/Players/${steamId}.json`), JSON.stringify(playerData), async (newFileErr) => {
                if(newFileErr) {
                    return interaction.followUp('An error occured saving your dino grow! Contact an admin!');
                }
            });
        });
    }
}
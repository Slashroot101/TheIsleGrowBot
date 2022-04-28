const { resolve } = require('path');
const { readFile, writeFile, exists } = require('fs');
const { DinoVault, User } = require('../model');
const uuid = require('uuid');

module.exports = class IslePlayerDatabase {

	constructor(playerDatabase) {
		console.log('Constructing player database with ' + playerDatabase);
		if (!playerDatabase) {
			throw new Error('Player database file path is required!');
		}
		this.getPlayerSave = this.getPlayerSave.bind(this);
		this.databasePath = playerDatabase;
	}

	async doesPlayerFileExist(steamId) {
		return new Promise((res) => {
			exists(`${this.databasePath}/Survival/Players/${steamId}.json`, async (exists) => {
				res(exists);
			});
		});
	}

	async getPlayerSave(steamId) {
		return new Promise((res, rej) => {
			readFile(`${this.databasePath}/Survival/Players/${steamId}.json`, async (err, data) => {
				if (err) rej(err);
				res(data);
			});
		});
	}

	async writePlayerSave(steamId, playerData) {
		return new Promise((res, rej) => {
			writeFile(resolve(`${this.databasePath}/Survival/Players/${steamId}.json`), playerData, async (newFileErr) => {
				if (newFileErr) rej(newFileErr);
				res();
			});
		});
	}

  async vaultRandom(dino, dinoJson, userId){
    const dinoName = `${dinoData[dino].displayName}-${uuid.v4()}`;
    const vaultedDino = await new DinoVault({dinoDisplayName: dinoData[dino].displayName, savedName: dinoName, dinoJson: JSON.stringify(dinoJson), vaultedById: userId}).save();

    return vaultedDino;
  }

  async vaultAndInject(dino, userId){
    const user = await User.findOne({where: {id: userId}});
    const json = await this.getPlayerSave(user.steamId);
    console.log(user, dino, userId)
    const vaultedDino = await this.vaultRandom(dino, json, userId);
  }

  async slayAndInject(){

  }
};
const { resolve } = require('path');
const { readFile, writeFile, exists } = require('fs');

module.exports = class IslePlayerDatabase {

	constructor(playerDatabase) {
		console.log('Constructing player database with ' + playerDatabase);
		if (!playerDatabase) {
			throw new Error('Player database file path is required!');
		}

		this.databasePath = playerDatabase;
	}

	async doesPlayerFileExist(steamId) {
		return new Promise((res) => {
			exists(`${this.databasePath}/Survival/Players/${steamId}.json`, async () => {
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
};
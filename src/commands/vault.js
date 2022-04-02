const { SlashCommandBuilder } = require('@discordjs/builders');
const { User, DinoVault } = require('../model');
const { stat, readdir, rm, readFile, read } = require('fs');
const { playerDatabase } = require('../config');
const dinoData = require('./commandData/dino.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('vault')
		.setDescription('Adds your current dino to a vault')
		.addStringOption(opt =>
			opt.setName('name')
				.setDescription('What you want to name the vaulted dino.')
				.setRequired(true)),
	adminRequired: false,
	requiresSteamLink: true,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 7200,
	},
	async execute(interaction) {
		const user = await User.findOne({ where: { discordId: interaction.user.id } });
		const name = interaction.options.get('name').value;
		if (user.steamId === null) {
			return interaction.reply('You must have linked your steam ID before you can use the vault command!');
		}

		stat(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (err, stats) => {
			if (err) {
				if (err.code === 'ENOENT') {
					return interaction.reply('You do not have a dino to vault right now!');
				}
				return interaction.reply('An error occured while trying to find your dino save.');
			}

			if (stats.mtime.getTime() <= new Date().getTime() - 60000 * 5) {
				return interaction.reply('You have to safe log and run this command within 5 minutes');
			}
			readFile(`${playerDatabase}/Survival/Players/${user.steamId}.json`, 'utf8', async (err, jsonData) => {
				if (err) {
					return interaction.reply('An error occured while reading your player save for vaulting.');
				}

				rm(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (err) => {
					if (err) {
						return interaction.reply('An error occured while deleting your player save for vaulting.');
					}
					const data = JSON.parse(JSON.parse(jsonData));
					await new DinoVault({ savedName: name, vaultedById: user.id, dinoDisplayName: dinoData[data['CharacterClass']].displayName, dinoJson: jsonData }).save();

					return interaction.reply(`Successfully put ${name} into the vault!`);
				});
			});
		});
	},
};
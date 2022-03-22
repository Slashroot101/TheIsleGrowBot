const { SlashCommandBuilder } = require('@discordjs/builders');
const {User, DinoVault} = require('../model');
const { stat, readdir, rm, readFile, read } = require('fs');
const {playerDatabase} = require('../config');
const IslePlayerDatabase = require('../lib/IslePlayerDatabase');
const dinoData = require('./commandData/dino.json');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restore')
		.setDescription('Restores the dino that you input!')
		.addStringOption(opt => 
			opt.setName('id')
				.setDescription('The ID of the dino to restore')
				.setRequired(true)),
    adminRequired: false,
    requiresSteamLink: true,
		cooldown: {
			hasCooldown: true,
			cooldownExecutions: 1,
			cooldownInMinutes: 7200,
		},
	async execute(interaction) {
		const user = await User.findOne({where: {discordId: interaction.user.id}});

		if(user.steamId === null){
				return interaction.reply('You must have linked your steam ID before you can use the grow command!');
		}

		const playerDatabaseInstance = new IslePlayerDatabase(playerDatabase);

		const vaultedDino = await DinoVault.findOne({where: {id: interaction.options.get('id').value}});

		if(!vaultedDino){
			return interaction.reply('No dino was found vaulted with that ID. Please try again with a valid ID');
		}

		var alreadyHasDino = await playerDatabaseInstance.doesPlayerFileExist(user.steamId);

		if(alreadyHasDino) {
			const row = new MessageActionRow()
			.addComponents(
					new MessageButton()
							.setCustomId('DinoGrowAccept')
							.setLabel('Yes')
							.setStyle('SUCCESS'),
					new MessageButton()
							.setCustomId('DinoGrowDeny')
							.setLabel('No')
							.setStyle('DANGER')
			)  

			await interaction.reply({content: 'Do you want to slay your existing dino and vault this one?', components: [row]})

			const filter = i => i.customId === 'DinoGrowAccept' || i.customId === 'DinoGrowDeny';

			const collector = interaction.channel.createMessageComponentCollector({filter, time: 15000});
			let isCollectionSuccess = false;
			collector.on('collect', async i => {
				isCollectionSuccess = true;
				if (i.customId === 'DinoGrowAccept'){ 
					const playerSave = await playerDatabaseInstance.getPlayerSave(user.steamId);
					const dinoJson = JSON.parse(JSON.parse(playerSave));
					await new DinoVault({dinoDisplayName: dinoData[dinoJson['CharacterClass']].displayName, savedName: 'auto-vaulted', dinoJson: JSON.stringify(playerSave)}).save();
					await playerDatabaseInstance.writePlayerSave(user.steamId, vaultedDino.dinoJson);
					await DinoVault.destroy({where: {id: vaultedDino.id}});
					return interaction.followUp('Your dino was succesfully restored!');
				} else if (i.customid === 'DinoGrowDeny') {
					return interaction.reply('You denied your restore. Revaulting the dino');
				}
			});

			collector.on('end', c => {
				if(!isCollectionSuccess){
						interaction.followUp('Command timed out. Please run the command again!');
				}
		});
		} else {
			await playerDatabaseInstance.writePlayerSave(user.steamId, vaultedDino.dinoJson);
			await DinoVault.destroy({where: {id: vaultedDino.id}});
			return interaction.reply('Your dino was succesfully restored!');
		}
	},
};
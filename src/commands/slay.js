const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../model');
const { rm, exists } = require('fs');
const { playerDatabase } = require('../config');
const { MessageActionRow, MessageButton } = require('discord.js');
const logger = require('../lib/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slay')
		.setDescription('Slays your current dino!'),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 7200,
	},
	requiresSteamLink: true,
	async execute(interaction) {
		const user = await User.findOne({ where: { discordId: interaction.user.id } });

		if (!user.steamId) {
			logger.info(`Executing ${interaction.commandName} but the user [userId${user.discordId}] does not have their steam linked`);
			return await interaction.reply('you must link your steam before you can run this command!');
		}

		exists(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async () => {
			if (exists) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('DinoSlayAccept')
							.setLabel('Yes')
							.setStyle('SUCCESS'),
						new MessageButton()
							.setCustomId('DinoSlayDeny')
							.setLabel('No')
							.setStyle('DANGER'),
					);


				await interaction.reply({ content: 'Are you sure you want to slay your existing dino?', components: [row] });

				const filter = i => i.customId === 'DinoSlayAccept' || i.customId === 'DinoSlayDeny';

				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
				let isCollectionSuccess = false;
				collector.on('collect', async () => {
					isCollectionSuccess = true;
					rm(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (err) => {
						if (err) {
							logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but an error occured`);
							await interaction.reply(' an error occured while slaying your dino');
						}

						logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] and succeeded`);
						await interaction.followUp('Your slay request has suceeded!');
					});
				});

				collector.on('end', async () => {
					if (!isCollectionSuccess) {
						logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but it timed out.`)
						await interaction.reply('Command timed out. Please run the command again!');
					}
				});
			}
			else {
				logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but they did not have a dino to slay`);
				await interaction.reply(' You do not have a dino to slay!');
			}
		});
	},
};
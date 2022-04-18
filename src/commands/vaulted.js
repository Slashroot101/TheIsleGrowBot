const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const logger = require('../lib/logger');
const { User } = require('../model');
const { DinoVault } = require('../model');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vaulted')
		.setDescription('Returns a list of your vaulted dinosaurs!'),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 5,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const user = await User.findOne({ where: { discordId: interaction.user.id } });

		if (user.steamId === null) {
			logger.info(`Executing ${interaction.commandName} but the user [userId=${user}] did not have their steam linked`);
			return interaction.reply('You must link your steam ID before using this command!');
		}

		const vaulted = await DinoVault.findAll({ where: { vaultedById: user.id } });
		const fields = [];
		vaulted.forEach(e => {
			fields.push({ name: e.dinoDisplayName, value: `[${e.id}] ${e.savedName}` });
		});
		const embed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Vaulted Dinosaurs')
			.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL(), url: '' })
			.setDescription('Here is a list of your vaulted Dinos!')
			.setThumbnail('https://media.istockphoto.com/photos/dinosaur-picture-id637987838?b=1&k=20&m=637987838&s=170667a&w=0&h=zAXR7LY31e1zm_DcwW8Fwu3AkwhTB0ZH6NAY1UIGI9o=')
			.addFields(
				fields,
			)
			.setImage('https://media.istockphoto.com/photos/dinosaur-picture-id637987838?b=1&k=20&m=637987838&s=170667a&w=0&h=zAXR7LY31e1zm_DcwW8Fwu3AkwhTB0ZH6NAY1UIGI9o=')
			.setTimestamp();
		logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] succesfully`)
		return await interaction.reply({ embeds: [embed] });
	},
};
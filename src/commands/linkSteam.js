const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../model');
const { oauthUrl, host, port } = require('../config');
const logger = require('../lib/logger');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('linksteam')
		.setDescription('Links your steam account to fossil bot.'),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 5,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const users = await User.findAll({ where: { discordId: interaction.user.id } });
		if (users.length && users[0].steamId !== null) return interaction.reply('A user with your Discord ID or Steam ID is already registered!');
		logger.info(`Executing ${interaction.commandName} for user [userId=${interaction.user.id}]`);
		await interaction.reply(`Visit to authenticate your account: ${oauthUrl + "&" + encodeURIComponent(`redirect_uri=http://${host}:${port}`)}`);
	},
};
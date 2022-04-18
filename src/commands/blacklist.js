const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../lib/logger');
const { User } = require('../model');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklist')
		.setDescription('Blacklist the user!')
		.addStringOption(opt =>
			opt.setName('id')
				.setDescription('The ID of the steam user to blacklist.')
				.setRequired(true))
		.addStringOption(opt =>
			opt.setName('isblacklisted')
				.setDescription('Whether or not the user is blacklisted.')
				.addChoice('Yes', 'Y')
				.addChoice('No', 'N')
				.setRequired(true),
		),
	adminRequired: true,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const isBlacklisted = interaction.options.get('isblacklisted').value;
		const userId = interaction.options.get('id').value;
		const user = await User.findOne({ where: { discordId: userId } });
		if (!user) {
			logger.info(`Executing ${interaction.commandName} targeting [userId=${user.id}] but no user was found, creating`);
			await new User({ discordId: userId }).save();
		}

		await User.update({ isBlacklisted }, { where: { discordId: userId } });
		interaction.reply('The user has been blacklisted!');
	},
};
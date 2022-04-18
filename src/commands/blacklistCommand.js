const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../lib/logger');
const { User, Command, UserCommandBlacklist } = require('../model');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('blacklistcommand')
		.setDescription('Blacklists a specific command from a user')
		.addMentionableOption(opt =>
			opt.setName('user').setDescription('The user you want to blacklist').setRequired(true))
		.addStringOption(opt =>
			opt.setName('command')
				.setDescription('The command you want to blacklist them from')
				.setRequired(true))
		.addBooleanOption(opt =>
			opt.setName('isblacklisted')
				.setDescription('Whether or not the user is blacklisted.')
				.setRequired(true),
		),
	adminRequired: true,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const user = interaction.options.get('user').value;
		const command = interaction.options.get('command').value;
		const isblacklisted = interaction.options.get('isblacklisted').value;

		const savedCommand = await Command.findOne({ where: { name: command } });
		if (!savedCommand) {
			logger.info(`Executing command ${interaction.commandName} and tried to pass in command value ${command}, which does not exist, neglecting`);
			return interaction.reply('The command you provided does not exist!');
		}

		const savedUser = await User.findOne({ where: { discordId: user } });
		if (!savedUser) {
			logger.info(`Executing command ${interaction.commandName} on target user [userId=${user}] by admin user [userId=${interaction.user.id}] but user did not exist, creating`);
			await new User({ discordId: user }).save();
		}

		if (isblacklisted) {
			logger.info(`Executing command ${interaction.commandName} on target user [userId=${user}] by admin user [userId=${interaction.user.id}], blacklisting`);
			await new UserCommandBlacklist({ isBlackListed: true, CommandId: savedCommand.id, UserId: savedUser.id }).save();
		}
		else {
			logger.info(`Executing command ${interaction.commandName} on target user [userId=${user}] by admin user [userId=${interaction.user.id}], unblacklisting`);
			await UserCommandBlacklist.destroy({ where: { CommandId: savedCommand.id, UserId: savedUser.id } });
		}

		return interaction.reply('The user was succesfully blacklisted from that command');
	},
};
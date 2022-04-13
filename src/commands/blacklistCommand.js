const { SlashCommandBuilder } = require('@discordjs/builders');
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
			return interaction.reply('The command you provided does not exist!');
		}

		const savedUser = await User.findOne({ where: { discordId: user } });
		if (!savedUser) {
			await new User({ discordId: user }).save();
		}

		if (isblacklisted) {
			await new UserCommandBlacklist({ isBlackListed: true, CommandId: savedCommand.id, UserId: savedUser.id }).save();
		}
		else {
			await UserCommandBlacklist.destroy({ where: { CommandId: savedCommand.id, UserId: savedUser.id } });
		}

		return interaction.reply('The user was succesfully blacklisted from that command');
	},
};
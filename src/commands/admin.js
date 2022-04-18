const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../lib/logger');
const User = require('../model/User');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('promote')
		.setDescription('Promotes the user to admin!')
		.addMentionableOption(opt =>
			opt.setName('id')
				.setDescription('The ID of the steam user to promote.')
				.setRequired(true))
		.addStringOption(opt =>
			opt.setName('isadmin')
				.setDescription('Whether or not the user is promoted.')
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
		const isPromoted = interaction.options.get('isadmin').value;
		const userId = interaction.options.get('id').value;
		const user = await User.findOne({ where: { discordId: userId } });
		if (!user) {
			logger.info(`User [discordId=${interaction.user.id}] executed ${interaction.commandName}, but target user [userId=${userId}] did not exist`);
			await new User({ discordId: userId }).save();
		}

		logger.info(`User [discordI=${interaction.user.id}] executed ${interaction.commandName} and promoted [userId=${userId}] to admin === ${isPromoted}`);
		await User.update({ isAdmin: isPromoted }, { where: { discordId: userId } });
		interaction.reply(`The user has been ${isPromoted === 'Y' ? 'promoted' : 'demoted'}!`);
	},
};
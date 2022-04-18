const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../lib/logger');
const { User } = require('../model');
const UserBank = require('../model/UserBank');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bal')
		.setDescription('Replies with your fossil balance!'),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const user = await User.findOne({ where: { discordId: interaction.user.id } });
		let bank = await UserBank.findOne({ where: { UserId: user.id } });
		if (!bank) {
			logger.info(`User [userId=${interaction.user.id}] tried to run ${interaction.commandName} but did not have a user bank. Creating`);
			bank = await new UserBank({ UserId: user.id, balance: 0 }).save();
		}
		interaction.reply(`You have ${bank.balance == null ? 0 : bank.balance} fossils!`);
	},
};
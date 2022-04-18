const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../lib/logger');
const { User } = require('../model');
const UserBank = require('../model/UserBank');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('grant')
    .addMentionableOption(x => x.setName('user').setDescription('The user to grant the fossils to'))
    .addIntegerOption(x => x.setName('amount').setDescription('The amount to grant'))
		.setDescription('Replies with your fossil balance!'),
	adminRequired: true,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
    const mentionedUser = interaction.options.get('user').value;
    const amount = interaction.options.get('amount').value;
		let user = await User.findOne({ where: { discordId: mentionedUser } });
    if(!user) {
			logger.info(`User [userId=${mentionedUser}] not found while executing ${interaction.commandName}`)
      user = await new User({discordId: mentionedUser}).save();
    }
		let bank = await UserBank.findOne({ where: { UserId: user.id } });
    console.log(bank)
		if (!bank) {
			logger.info(`User bank [userId=${mentionedUser}] not found while executing ${interaction.commandName}`)
			bank = await new UserBank({ UserId: user.id, balance: amount }).save();
		} else {
      bank = await UserBank.update({balance: bank.balance + amount}, {where: {UserId: user.id}});
    }
		interaction.reply(`Succesfully granted ${bank.balance == null ? 0 : bank.balance} fossils!`);
	},
};
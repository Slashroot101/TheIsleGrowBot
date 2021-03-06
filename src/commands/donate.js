const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../model');
const { createPaymentLink } = require('../lib/stripeAccessor');
const logger = require('../lib/logger');
const { currencyName } = require('../config');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('donate')
		.addIntegerOption(opt => opt.setName('amount').setDescription(`How many ${currencyName} you would like to donate for`).setRequired(true))
		.setDescription(`Creates a payment link for you to buy ${currencyName} from`),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 5,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const amount = interaction.options.get('amount').value;
		if (amount === 0) {
			return interaction.reply('You have to donate a non-zero amount :^)');
		}
		const user = await User.findOne({ where: { discordId: interaction.user.id } });
		const link = await createPaymentLink(amount, user.id, interaction.user.id);
		logger.info(`Executing ${interaction.commandName} for user to purchase ${amount} ${currencyName}`);
		return interaction.reply(`Thank you for considering donating! Here is your donation link for ${amount} ${currencyName}: ` + link.url);
	},
};
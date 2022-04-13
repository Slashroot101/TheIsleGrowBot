const { SlashCommandBuilder } = require('@discordjs/builders');
const { UserBank } = require('../model');
const User = require('../model/User');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setbalance')
		.setDescription('Sets the users balance!')
		.addStringOption(opt =>
			opt.setName('discordid')
				.setDescription('The discord id of the user to promote.')
				.setRequired(true))
		.addStringOption(opt =>
			opt.setName('amount')
				.setDescription('The value to set the users bank to set.')
				.setRequired(true),
		),
	adminRequired: true,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const discordId = interaction.options.get('discordid').value;
		const amount = interaction.options.get('amount').value;

		let user = await User.findOne({ where: { discordId } });

		if (!user) {
			user = await new User({ discordId }).save();
			await new UserBank({ balance: 0, UserId: discordId }).save();
		}

		await UserBank.update({ balance: amount }, { where: { UserId: user.id } });

		await interaction.reply('Updated the user\'s balance!');
	},
};
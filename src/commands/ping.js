const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
    adminRequired: false,
		cooldown: {
			hasCooldown: true,
			cooldownExecutions: 1,
			cooldownInMinutes: 1,
		},
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
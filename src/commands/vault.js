const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vault')
		.setDescription('Adds your current dino to a vault'),
    adminRequired: false,
    requiresSteamLink: true,
	async execute(interaction) {
		
	},
};
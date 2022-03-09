const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../model');
const UserBank = require('../model/UserBank');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vaulted')
		.setDescription('Returns a list of your vaulted dinosaurs!'),
    adminRequired: false,
	async execute(interaction) {
        
	},
};
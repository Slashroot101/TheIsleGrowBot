const { SlashCommandBuilder } = require('@discordjs/builders');
const {User, DinoVault} = require('../model');
const { stat, readdir, rm, readFile, read } = require('fs');
const {playerDatabase} = require('../config');
const dinoData = require('./commandData/dino.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('restore')
		.setDescription('Restores the dino that you input!')
		.addStringOption(opt => 
			opt.setName('id')
				.setDescription('The ID of the dino to restore')
				.setRequired(true)),
    adminRequired: false,
    requiresSteamLink: true,
	async execute(interaction) {
	
	},
};
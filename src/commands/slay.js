const { SlashCommandBuilder } = require('@discordjs/builders');
const {User, DinoVault} = require('../model');
const { stat, readdir, rm, readFile, read } = require('fs');
const {playerDatabase} = require('../config');
const dinoData = require('./commandData/dino.json');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('slay')
		.setDescription('Slays your current dino!'),
    adminRequired: false,
    requiresSteamLink: true,
	async execute(interaction) {
        const user = await User.findOne({where: {discordId: interaction.user.id}});

        if(!user){
           return await interaction.reply('you must link your steam before you can run this command!');
        }
	},
};
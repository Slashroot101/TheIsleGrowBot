const { SlashCommandBuilder } = require('@discordjs/builders');
const {User} = require('../model');
const { stat } = require('fs');
const {playerDatabase} = require('../config');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('vault')
		.setDescription('Adds your current dino to a vault')
		.addStringOption(opt => 
			opt.setName('name')
				.setDescription('What you want to name the vaulted dino.')
				.setRequired(true)),
    adminRequired: false,
    requiresSteamLink: true,
	async execute(interaction) {
		const user = await User.findOne({where: {discordId: interaction.user.id}});

        if(user.steamId === null){
            return interaction.reply('You must have linked your steam ID before you can use the vault command!');
        }

		stat(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (err, stats) => {
			if(err){
				if(err.code === 'ENOENT'){
					return interaction.reply('You do not have a dino to vault right now!');
				}
				return interaction.reply('An error occured while trying to find your dino save.')
			}

			if(stats.mtime.getTime() <= new Date().getTime()  - 60000 * 5) {
				return interaction.reply('You have to safe log and run this command within 5 minutes');
			}

			
		});
	},
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { exists } = require('fs');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('vault')
		.setDescription('Adds your current dino to a vault')
		.addStringOption(opt => 
			opt.setName('name')
				.setDescription('What you want to name the vaulted dino.')
				.addChoice('Yes', 'Y')
				.addChoice('No', 'N')
				.setRequired(true)),
    adminRequired: false,
    requiresSteamLink: true,
	async execute(interaction) {
		const user = await User.findOne({where: {discordId: interaction.user.id}});

        if(user.steamId === null){
            return interaction.reply('You must have linked your steam ID before you can use the vault command!');
        }

		exists(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (exists) => {
		
		});
	},
};
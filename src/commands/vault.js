const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vault')
		.setDescription('Adds your current dino to a vault'),
    adminRequired: false,
    requiresSteamLink: true,
	async execute(interaction) {
		const user = await User.findOne({where: {discordId: interaction.user.id}});

        if(user.steamId === null){
            return interaction.reply('You must have linked your steam ID before you can use the vault command!');
        }
	},
};
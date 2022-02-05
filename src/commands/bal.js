const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../model');
const UserBank = require('../model/UserBank');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bal')
		.setDescription('Replies with your fossil balance!'),
    adminRequired: false,
	async execute(interaction) {
        const user = await User.findOne({where: {discordId: interaction.user.id}});
		let bank = await UserBank.findOne({where: {UserId: user.id}});
        if(!bank){
            bank = await new UserBank({UserId: user.id, balance: 0});
        }
        interaction.reply(`You have ${bank.balance == null ? 0 : bank.balance} fossils!`);
	},
};
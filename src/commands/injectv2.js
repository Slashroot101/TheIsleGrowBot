const { SlashCommandBuilder } = require('@discordjs/builders');
const InjectionWorkflow = require('../lib/InjectionWorkflow');
const {User} = require('../model/index');
const {differenceInSeconds} = require('date-fns');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('injectv2')
		.setDescription('Uses fossils to grow a sandbox/apex dinosaur. Use /grow to grow any other kind of dino.'),
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 7200,
	},
  adminRequired: false,
	requiresSteamLink: true,
	async execute(interaction) {
    const user = await User.findOne({where: {discordId: interaction.user.id}});
    const workflow = await (await new InjectionWorkflow().next(user.dataValues.id, false))(interaction, user.dataValues.id);
  }
}
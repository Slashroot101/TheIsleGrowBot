const { SlashCommandBuilder } = require('@discordjs/builders');
const { Command } = require('../model/');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('maintenance')
		.setDescription('Turns maintenance mode on for a command.')
		.addStringOption(opt =>
			opt.setName('name')
				.setDescription('The command name.')
				.setRequired(true))
		.addBooleanOption(option => option.setName('ismaintenancemode').setDescription('Should maintenance mode be turned on for the command.').setRequired(true)),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const commandName = interaction.options.get('name').value;
		const bool = interaction.options.get('ismaintenancemode').value;
		const command = await Command.findOne({ where: { name: commandName } });

		if (!command) {
			return interaction.reply('That command does not exist!');
		}
		require(`./${commandName}.js`).isMaintenanceModeEnabled = bool;
		await Command.update({ isMaintenanceModeEnabled: bool }, { where: { id: command.id } });
		await interaction.reply(`Updated ${command.name} to maintenance mode ${bool}`);
	},
};
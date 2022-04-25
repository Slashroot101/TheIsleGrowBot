const { SlashCommandBuilder } = require('@discordjs/builders');
const { User, InjectSpawnLocations } = require('../model');
const { instanceRoles } = require('../deploy-roles');
const logger = require('../lib/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('updatespawn')
		.setDescription('Updates a spawn that injects can spawn at')
		.addStringOption(opt =>
			opt.setName('name')
				.setDescription('The name of the spawn locations that users will see')
				.setRequired(true))
		.addStringOption(opt =>
			opt.setName('location')
				.setDescription('XYZ location of spawn point')
				.setRequired(true)),
	adminRequired: true,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const name = interaction.options.get('name').value;
		const location = interaction.options.get('location').value;
		logger.info(`Executing ${interaction.commandName} and adding spawn location ${name} with location ${location}`);
		await new InjectSpawnLocations({spawnPoint: location, name}).save();

		await interaction.reply(`Added spawn location ${name} with coordinates ${location}`);
	},
};
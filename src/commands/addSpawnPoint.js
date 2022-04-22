const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../model');
const { instanceRoles } = require('../deploy-roles');
const logger = require('../lib/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addspawn')
		.setDescription('Adds a spawn that users can choose')
		.addMentionableOption(opt =>
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

	},
};
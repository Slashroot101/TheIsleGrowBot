const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../model');
const { instanceRoles } = require('../deploy-roles');
const logger = require('../lib/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('apex')
		.setDescription('Promotes the user to be able to use apex dinosaurs!')
		.addMentionableOption(opt =>
			opt.setName('discordid')
				.setDescription('The ID of your discord account.')
				.setRequired(true))
		.addStringOption(opt =>
			opt.setName('isapexapproved')
				.setDescription('Whether or not the user is apex approved.')
				.addChoice('Yes', 'Y')
				.addChoice('No', 'N')
				.setRequired(true)),
	adminRequired: true,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const discordId = interaction.options.get('discordid').value;
		const isApexApproved = interaction.options.get('isapexapproved').value;
		const member = await interaction.guild.members.fetch(discordId);
		if (isApexApproved === 'Y') {
			logger.info(`Adding apex approval to user [userId=${discordId}] by user [userId=${interaction.user.id}]`);
			await member.roles.add(instanceRoles.get('apexApproved').id);
		}
		else {
			logger.info(`Removing apex approval from user [userId=${discordId}] by user [userId=${interaction.user.id}]`);
			await member.roles.remove(instanceRoles.get('apexApproved').id);
		}
		await User.update({ isApexApproved }, { where: { discordId } });
		await interaction.reply('Updated user apex approval status');
	},
};
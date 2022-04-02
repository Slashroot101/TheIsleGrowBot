const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandAudit, User, Command } = require('../model');
const { subMinutes, formatRelative } = require('date-fns');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('audit')
		.setDescription('Audits the user commands!')
		.addMentionableOption(opt =>
			opt.setName('id')
				.setDescription('The ID of the steam user that you want to audit!')
				.setRequired(true)),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 5000,
		cooldownInMinutes: 1,
	},
	async execute(interaction) {
		const userId = interaction.options.get('id').value;

		const commands = await CommandAudit.findAll({ where: { '$discordId$': userId }, include: [{ model: User, required: true }, Command], order: [['executionTime', 'desc']], limit: 50 });
		const fields = commands.map(x => {return { name: x.Command.name, value: formatRelative(x.dataValues.executionTime, new Date()), inline: true };});
		const exampleEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Audit Log')
			.setAuthor({ name: userId })
			.setDescription('An audit log of commands')
			.addFields(
				fields,
			)
			.setTimestamp();

		return interaction.reply({ embeds: [exampleEmbed] });
	},
};
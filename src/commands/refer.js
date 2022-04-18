const { SlashCommandBuilder } = require('@discordjs/builders');
const { User, Referral } = require('../model');
const { referralAward } = require('../config');
const { differenceInCalendarDays } = require('date-fns');
const logger = require('../lib/logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('refer')
		.setDescription('Credits you for referring a friend!')
		.addMentionableOption(opt =>
			opt.setName('id')
				.setDescription('The ID of the steam user that you referred!')
				.setRequired(true)),
	adminRequired: false,
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 5,
		cooldownInMinutes: 1,
	},
	async execute(interaction, client) {
		const userId = interaction.options.get('id').value;
		if (userId === interaction.user.id) {
			logger.info(`Executing ${interaction.commandName} user [userId=${interaction.user.id}] tried to refer themselves, neglecting`)
			return interaction.reply('You cannot refer yourself!');
		}
		let user = await User.findOne({ where: { discordId: userId } });
		const referredByUser = await User.findOne({ where: { discordId: interaction.user.id } });
		if (!user) {
			logger.info(`Executing ${interaction.commandName} tried to find user [userId=${userId}] but could not find, creating`);
			user = await new User({ discordId: userId }).save();
		}
		const fetchedUser = await client.users.fetch(userId);

		const guild = client.guilds.cache.get(interaction.guild.id);
		const member = guild.members.cache.get(fetchedUser.id);

		const joinDate = member.joinedTimestamp;
		const today = new Date();

		if (differenceInCalendarDays(today, joinDate) < 10) {
			logger.info(`Executing ${interaction.commandName} tried to execute by user [userId=${interaction.user.id}], but the user has not been in the discord for more than 10 days`);
			return await interaction.reply('The user must have been in the server for more than 10 days!');
		}

		if (fetchedUser.bot) {
			logger.info(`Executing ${interaction.commandName} tried to execute by user [userId=${interaction.user.id}], but the user [userId=${userId}] is a bot, neglecting`);
			return await interaction.reply('You cannot refer a bot!');
		}

		const existingReferral = await Referral.findAll({ where: { referredUserId: user.id } });
		if (existingReferral.length > 0) {
			logger.info(`Executing ${interaction.commandName} tried to execute by user [userId=${interaction.user.id}], but the user [userId=${userId}] has already been referred`);
			return interaction.reply('This user has already been referred!');
		}

		await new Referral({ referralPointsEarned: referralAward, referredByUserId: referredByUser.id, referredUserId: user.id }).save();
		logger.info(`Executing ${interaction.commandName} succesfully to refer used [userId=${userId}] by user [userId=${interaction.user.id}]`)
		await User.update({ balance: user.balance + referralAward }, { where: { discordId: referredByUser.id } });
		interaction.reply('You have been credited 25 fossils for the referral!');
	},
};
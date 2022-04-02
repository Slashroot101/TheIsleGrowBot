const { SlashCommandBuilder } = require('@discordjs/builders');
const { User, Referral } = require('../model');
const { referralAward } = require('../config');
const { differenceInCalendarDays } = require('date-fns');

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
			return interaction.reply('You cannot refer yourself!');
		}
		let user = await User.findOne({ where: { discordId: userId } });
		const referredByUser = await User.findOne({ where: { discordId: interaction.user.id } });
		if (!user) {
			user = await new User({ discordId: userId }).save();
		}
		const fetchedUser = await client.users.fetch(userId);

		const guild = client.guilds.cache.get(interaction.guild.id);
		const member = guild.members.cache.get(fetchedUser.id);

		const joinDate = member.joinedTimestamp;
		const today = new Date();

		if (differenceInCalendarDays(today, joinDate) < 10) {
			return await interaction.reply('The user must have been in the server for more than 10 days!');
		}

		if (fetchedUser.bot) {
			return await interaction.reply('You cannot refer a bot!');
		}

		const existingReferral = await Referral.findAll({ where: { referredUserId: user.id } });
		if (existingReferral.length > 0) {
			return interaction.reply('This user has already been referred!');
		}

		await new Referral({ referralPointsEarned: referralAward, referredByUserId: referredByUser.id, referredUserId: user.id }).save();

		await User.update({ balance: user.balance + referralAward }, { where: { discordId: referredByUser.id } });
		interaction.reply('You have been credited 25 fossils for the referral!');
	},
};
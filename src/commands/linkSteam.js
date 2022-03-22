const {SlashCommandBuilder} = require('@discordjs/builders');
const { dbConnection } = require('../database');
const { Op } = require('sequelize');
const {User} = require('../model');
const {oauthUrl} = require('../config');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('linksteam')
        .setDescription('Links your steam account to fossil bot.'),
    adminRequired: false,
    cooldown: {
        hasCooldown: true,
        cooldownExecutions: 5,
        cooldownInMinutes: 1,
    },
    async execute(interaction) {
        const users = await User.findAll({where: { discordId: interaction.user.id, }});
        if(users.length && users[0].steamId !== null) return interaction.reply('A user with your Discord ID or Steam ID is already registered!');

        await interaction.reply(`Visit to authenticate your account: ${oauthUrl}`);
    }
};
const {SlashCommandBuilder} = require('@discordjs/builders');
const { dbConnection } = require('../database');
const { Op } = require('sequelize');
const {User} = require('../model');
const {instanceRoles} = require('../deploy-roles');
const {oauthUrl} = require('../config');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('linksteam')
        .setDescription('Links your steam account to fossil bot.'),
    adminRequired: false,
    async execute(interaction) {
        //await interaction.member.roles.add(instanceRoles.get('registrationRole').id);
        const users = await User.findAll({where: { discordId: interaction.user.id, }});
        if(users.length && users[0].steamId !== null) return interaction.reply('A user with your Discord ID or Steam ID is already registered!');

        await interaction.reply(`Visit to authenticate your account: ${oauthUrl}`);
    }
};
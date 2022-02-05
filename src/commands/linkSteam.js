const {SlashCommandBuilder} = require('@discordjs/builders');
const { dbConnection } = require('../database');
const { Op } = require('sequelize');
const {User} = require('../model');
const {instanceRoles} = require('../deploy-roles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Links your steam account to fossil bot.')
        .addStringOption(opt => 
                                opt.setName('id')
                                    .setDescription('The ID of your steam account.')
                                    .setRequired(true)),
    async execute(interaction) {
        try {
            const steamId = interaction.options.get('id').value;
            const isSteamId = /\d{17}/.test(steamId);
            if(!isSteamId) return interaction.reply('A valid steam ID must be provided.');
            await interaction.member.roles.add(instanceRoles.get('registrationRole').id);
            const users = await User.findAll({where: { [Op.or]: {discordId: interaction.user.id, steamId, }}});
            if(users.length) return interaction.reply('A user with your Discord ID or Steam ID is already registered!');
    
            await new User({steamId, discordId: interaction.user.id}).save();
            await interaction.reply('Linked steam account!');
        } catch (err){
            console.log(err);
        }

    }
};
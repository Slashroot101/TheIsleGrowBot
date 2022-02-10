const {SlashCommandBuilder} = require('@discordjs/builders');
const { dbConnection } = require('../database');
const { Op } = require('sequelize');
const {User} = require('../model');
const {instanceRoles} = require('../deploy-roles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apex')
        .setDescription('Promotes the user to be able to use apex dinosaurs!')
        .addStringOption(opt => 
                                opt.setName('discordid')
                                    .setDescription('The ID of your discord account.')
                                    .setRequired(true))
        .addStringOption(opt => 
                            opt.setName('isapexapproved')
                                .setDescription('Whether or not the user is apex approved.')
                                .addChoice('Yes', 'Y')
                                .addChoice('No', 'N')
                                .setRequired(true)),
    adminRequired: false,
    async execute(interaction) {
        const discordId = interaction.options.get('discordid').value;
        const isApexApproved = interaction.options.get('isapexapproved').value;
        const member = await interaction.guild.members.fetch(discordId);
        console.log(isApexApproved)
        if(isApexApproved === 'Y'){
            await member.roles.add(instanceRoles.get('apexApproved').id);
        } else {
            await member.roles.remove(instanceRoles.get('apexApproved').id);
        }
        await User.update({isApexApproved},{where: {discordId}});
        await interaction.reply('Updated user apex approval status');
    }
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const {User, DinoVault} = require('../model');
const { stat, readdir, rm, readFile, read, exists } = require('fs');
const {playerDatabase} = require('../config');
const dinoData = require('./commandData/dino.json');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('slay')
		.setDescription('Slays your current dino!'),
    adminRequired: false,
    cooldown: {
        hasCooldown: true,
        cooldownExecutions: 1,
        cooldownInMinutes: 1,
},
    requiresSteamLink: true,
        async execute(interaction) {
                const user = await User.findOne({where: {discordId: interaction.user.id}});

                if(!user.steamId){
                        return await interaction.reply('you must link your steam before you can run this command!');
                }

                exists(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (exists) => {
                        if(exists){    
                                const row = new MessageActionRow()
                                                .addComponents(
                                                        new MessageButton()
                                                        .setCustomId('DinoSlayAccept')
                                                        .setLabel('Yes')
                                                        .setStyle('SUCCESS'),
                                                        new MessageButton()
                                                        .setCustomId('DinoSlayDeny')
                                                        .setLabel('No')
                                                        .setStyle('DANGER')
                                                )  
                                
                
                                await interaction.reply({content: 'Are you sure you want to slay your existing dino?', components: [row]})
                
                                const filter = i => i.customId === 'DinoSlayAccept' || i.customId === 'DinoSlayDeny';
                
                                const collector = interaction.channel.createMessageComponentCollector({filter, time: 15000});
                                let isCollectionSuccess = false;
                                collector.on('collect', async i => {
                                        isCollectionSuccess = true;
                                        rm(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (err) => {
                                                if(err) {
                                                        await interaction.reply(' an error occured while slaying your dino');
                                                }

                                                await interaction.followUp('Your slay request has suceeded!');
                                        });
                                });
                
                                collector.on('end', async c => {
                                        if(!isCollectionSuccess){
                                                await interaction.reply('Command timed out. Please run the command again!');
                                        }
                                });
                        } else {
                                await interaction.reply(' You do not have a dino to slay!');
                        }
                        });
        },
};
const { SlashCommandBuilder } = require('@discordjs/builders');
const { resolve } = require('path');
const { readFile, writeFile, exists } = require('fs');
const { playerDatabase } = require('../config');
const User = require('../model/User');
const dinoData = require('./commandData/dino.json');
const { UserBank, GrowDinoRequest } = require('../model');
const growStatusEnum  = require('../model/Enum/GrowStatusEnum');
const { MessageActionRow, MessageButton } = require('discord.js');
const IslePlayerDatabase = require('../lib/IslePlayerDatabase');
const DinoFactory = require('../lib/DinoFactory');
const playerDataBaseAccessor = new IslePlayerDatabase(process.env.playerDatabase);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('grow')
		.setDescription('Uses fossils to grow your dino on the server.')
        .addStringOption(opt => {
                const options = opt.setName('dino').setDescription('The dinosaur you want to grow to');

                for(var key in dinoData){
                    options.addChoice(dinoData[key].displayName, dinoData[key].value);
                }

                return opt;
            }
        ),
        cooldown: {
			hasCooldown: true,
			cooldownExecutions: 1,
			cooldownInMinutes: 1,
		},
        cooldown: {
			hasCooldown: true,
			cooldownExecutions: 1,
			cooldownInMinutes: 1,
		},
    adminRequired: false,
    requiresSteamLink: true,
	async execute(interaction) {
        const dinoId = interaction.options.get('dino').value;
        const user = await User.findOne({where: {discordId: interaction.user.id}});

        if(user.steamId === null){
            return interaction.reply('You must have linked your steam ID before you can use the grow command!');
        }

        if(user.isApexApproved === 'N' && dinoData[dinoId].requiresApex){
            return interaction.reply('You must be apex approved to grow this dino!');
        }
        const userBank = await UserBank.findOne({where: {UserId: user.id}});
        var cost = dinoData[dinoId].cost;

        if(userBank === null || userBank.balance == null || userBank.balance - cost < 0) {
            return interaction.reply('You do not have enough fossils to afford that!');
        }

        if(user.steamId === null){
            return interaction.reply('You need to link your steam ID first with /link!')
        }
        console.log(growStatusEnum)
        var growDino = await new GrowDinoRequest({growStatus: growStatusEnum.initialize, cost, initiatedByDiscordId: interaction.user.id, dinoName: dinoData[dinoId].value, UserId: user.id}).save();

        exists(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (exists) => {
            if(exists){    
                const row = new MessageActionRow()
                                    .addComponents(
                                        new MessageButton()
                                            .setCustomId('DinoGrowAccept')
                                            .setLabel('Yes')
                                            .setStyle('SUCCESS'),
                                        new MessageButton()
                                            .setCustomId('DinoGrowDeny')
                                            .setLabel('No')
                                            .setStyle('DANGER')
                                    )  
                
                await GrowDinoRequest.update({growStatus: growStatusEnum.waitingOnUser}, {where: {id: growDino.id}});

                await interaction.reply({content: 'Do you want to slay your existing dino and inject/grow this one?', components: [row]})

                const filter = i => i.customId === 'DinoGrowAccept' || i.customId === 'DinoGrowDeny';

                const collector = interaction.channel.createMessageComponentCollector({filter, time: 15000});
                let isCollectionSuccess = false;
                collector.on('collect', async i => {
                    if (i.customId === 'DinoGrowAccept'){
                        isCollectionSuccess = true;
                        collector.stop();
                        await GrowDinoRequest.update({growStatus: growStatusEnum.processing}, {where: {id: growDino.id}});
                        await updateDinoFile(interaction, user, userBank, dinoId, cost);
                        await GrowDinoRequest.update({growStatus: growStatusEnum.processed}, {where: {id: growDino.id}});
                        await i.reply('Your grow has been processed!');
                    } else if (i.customId === 'DinoGrowDeny') {
                        isCollectionSuccess = true;
                        collector.stop();
                        await GrowDinoRequest.update({growStatus: growStatusEnum.declined}, {where: {id: growDino.id}});
                        await i.reply('Cancelling dino grow!');
                    }
                });

                collector.on('end', c => {
                    if(!isCollectionSuccess){
                        interaction.followUp('Command timed out. Please run the command again!');
                    }
                });
            } else {
                await writeNewDino(interaction, user, userBank, dinoId, cost);
                await interaction.followUp('Your grow has been processed!');
            }
        });
	},
};

async function updateDinoFile(interaction, user, userBank, dinoId, cost){
    var userSave = playerDataBaseAccessor.getPlayerSave(user.steamId);
    var json = JSON.parse(userSave);
    json.CharacterClass = dinoId;
    await playerDataBaseAccessor.writePlayerSave(user.steamId, JSON.stringify(json));
    await userBank.update({where: {UserId: user.id}}, {balance: userBank.balance - cost});
}

async function writeNewDino(interaction, user, userBank, dinoId, cost){
    const newFile = new DinoFactory()
                            .setCharacterClass(dinoId)
                            .render();

    await playerDataBaseAccessor.writePlayerSave(user.steamId, JSON.stringify(newFile));
    await userBank.update({where: {UserId: user.id}}, {balance: userBank.balance - cost});
}
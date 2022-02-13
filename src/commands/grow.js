const { SlashCommandBuilder } = require('@discordjs/builders');
const { resolve } = require('path');
const { readFile, writeFile, exists } = require('fs');
const { playerDatabase } = require('../config');
const User = require('../model/User');
const dinoData = require('./commandData/dino.json');
const { UserBank, GrowDinoRequest } = require('../model');
const growStatusEnum  = require('../model/Enum/GrowStatusEnum');
const { MessageActionRow, MessageButton } = require('discord.js');

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
    adminRequired: false,
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
    readFile(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (err, data) => {
        if(err) { 
            return interaction.followUp('An error occured during your grow!');
        }

        var json = JSON.parse(data);
        json.CharacterClass = dinoId;

        writeFile(`${playerDatabase}/Survival/Players/${user.steamId}.json`, JSON.stringify(json), async (writeErr) => {
            if(writeErr) {
                return interaction.followUp('An error occured saving your dino grow! Contact an admin!');
            }

            await userBank.update({where: {UserId: user.id}}, {balance: userBank.balance - cost});
        })
    });
}

async function writeNewDino(interaction, user, userBank, dinoId, cost){
    const newFile = {
        "CharacterClass": dinoId,
        "DNA": "",
        "Location_Isle_V3": "X=-33316.137 Y=533458.750 Z=-65061.266",
        "Rotation_Isle_V3": "P=0.000000 Y=87.753326 R=0.000000",
        "Growth": "1.0",
        "Hunger": "792",
        "Thirst": "56",
        "Stamina": "212",
        "Health": "3600",
        "BleedingRate": "0",
        "Oxygen": "40",
        "bGender": true,
        "bIsResting": false,
        "bBrokenLegs": false,
        "ProgressionPoints": "0",
        "ProgressionTier": "1",
        "UnlockedCharacters": "ParaAdultS;",
        "CameraRotation_Isle_V3": "P=0.000000 Y=177.753403 R=0.000000",
        "CameraDistance_Isle_V3": "599.999451",
        "SkinPaletteSection1": 50,
        "SkinPaletteSection2": 59,
        "SkinPaletteSection3": 20,
        "SkinPaletteSection4": 56,
        "SkinPaletteSection5": 22,
        "SkinPaletteSection6": 254,
        "SkinPaletteVariation": "6.0"
    };

    writeFile(resolve(`${playerDatabase}/Survival/Players/${user.steamId}.json`), JSON.stringify(newFile), async (newFileErr) => {
        if(newFileErr) {
            return interaction.followUp('An error occured saving your dino grow! Contact an admin!');
        }
        await userBank.update({where: {UserId: user.id}}, {balance: userBank.balance - cost});
    });
}
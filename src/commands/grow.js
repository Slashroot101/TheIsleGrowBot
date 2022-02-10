const { SlashCommandBuilder } = require('@discordjs/builders');
const { resolve } = require('path');
const { readFile, writeFile, exists } = require('fs');
const { playerDatabase } = require('../config');
const User = require('../model/User');
const dinoData = require('./commandData/dino.json');
const { UserBank } = require('../model');

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

        await interaction.deferReply();

        exists(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (exists) => {
            if(exists){      
                await updateDinoFile(interaction, user, userBank, dinoId, cost);
            } else {
                await writeNewDino(interaction, user, userBank, dinoId, cost);
            }

            await interaction.followUp('Your grow has been processed!');
        });
	},
};

async function updateDinoFile(interaction, user, userBank, dinoId, cost){
    readFile(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (err, data) => {
        if(err) { 
            console.log(err);
            return interaction.reply('An error occured during your grow!');
        }

        var json = JSON.parse(data);
        json.CharacterClass = dinoId;

        writeFile(`${playerDatabase}/Survival/Players/${user.steamId}.json`, JSON.stringify(json), async (writeErr) => {
            if(writeErr) {
                console.log(writeErr);
                return interaction.reply('An error occured saving your dino grow! Contact an admin!');
            }

            await userBank.update({where: {UserId: user.id}}, {balance: userBank.balance - cost});
            return interaction.reply('Your dinosaur has been grown!');
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
            return interaction.reply('An error occured saving your dino grow! Contact an admin!');
        }
        await userBank.update({where: {UserId: user.id}}, {balance: userBank.balance - cost});
    });
}
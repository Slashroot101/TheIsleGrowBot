const { SlashCommandBuilder } = require('@discordjs/builders');
const { playerDatabase, maxApex } = require('../config');
const User = require('../model/User');
const {Op} = require('sequelize');
const dinoData = require('./commandData/dino.json');
const { UserBank, GrowDinoRequest, DinoStats, DinoVault } = require('../model');
const growStatusEnum = require('../model/Enum/GrowStatusEnum');
const { MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const IslePlayerDatabase = require('../lib/IslePlayerDatabase');
const DinoFactory = require('../lib/DinoFactory');
const logger = require('../lib/logger');
const playerDataBaseAccessor = new IslePlayerDatabase(process.env.playerDatabase);
const uuid = require('uuid');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('inject')
		.setDescription('Uses fossils to grow a sandbox/apex dinosaur. Use /grow to grow any other kind of dino'),
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 7200,
	},
	adminRequired: false,
	requiresSteamLink: true,
	async execute(interaction) {
		const user = await User.findOne({ where: { discordId: interaction.user.id } });

		if (user.steamId === null) {
			logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but the user did not have steam linked`);
			return await interaction.reply('You must have linked your steam ID before you can use the grow command!');
		}

		if (user.isApexApproved === 'N' && dinoData[dinoId].requiresApex) {
			logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but the user was not apex approved`)
			return await interaction.reply('You must be apex approved to grow this dino!');
		}

		const dinos = [];
		for(const key in dinoData){
			dinos.push(dinoData[key])
		}
		console.log((user.isApexApproved === 'Y'))
		const selectOptions = dinos
															.filter(x => x.isSandbox === true || x.requiresApex === (user.isApexApproved === 'Y'))
															.map(x => {
																	return {
																		label: x.displayName,
																		description: `Apex: ${x.requiresApex}`,
																		value: x.value
																	}
																}
															);
																console.log(selectOptions)
		const row = new MessageActionRow()
		.addComponents(
			new MessageSelectMenu()
				.setCustomId('DinoSelectId')
				.setPlaceholder('Nothing selected')
				.addOptions(selectOptions),
		);
		
		await interaction.reply({ content: 'Select your dino from the list below!', components: [row] });
		const scFilter = i => i.customId === 'DinoSelectId' && i.user.id === interaction.user.id;
		const selectCollector = interaction.channel.createMessageComponentCollector({ scFilter, time: 15000 });
		let hasCollected = false;
	  selectCollector.on('end', async (i) => {
			if(!hasCollected){
				await interaction.editReply({content: 'The injection timed out! Please try again :)', components: []});
			}
		});

		selectCollector.on('collect', async sc => {
			interaction.editReply({content: 'Processing!', components: []});
			hasCollected = true;
			const dinoId = sc.values[0];
			if(dinoData[dinoId].requiresApex) {
				const rexAlias = ['RexAdultS', 'RexSubS', 'RexJuvS'];
				const gigaAlias = ['GigaAdultS', 'GigaSubS', 'GigaJuvS'];
				const spinoAlias = ['Spino', 'SpinoJuv'];
				let filter = [];
				if(rexAlias.indexOf(dinoId) >= 0) {
					filter = rexAlias;
				} else if (gigaAlias.indexOf(dinoId) >= 0) {
					filter = gigaAlias
				} else {
					filter = spinoAlias;
				}
				const dinoStats = await DinoStats.findAll({where: { dinoName: {[Op.in]: [...filter]}}});
				const numDinos = dinoStats.map(x => x.dataValues).reduce((a, b) => b.count + a, 0);
				if(numDinos >= Number(maxApex)){
					logger.info(`User [discordId=${interaction.user.id}] tried to grow [dinoId=${dinoId}] but there were already more than ${numDinos}/${maxApex} apex`);
					return await sc.reply('There are too many of that apex on the server. Try again when there are not.');
				}
			}
	
			const userBank = await UserBank.findOne({ where: { UserId: user.id } });
			const cost = dinoData[dinoId].cost;
	
			if (cost !== 0 && userBank === null || userBank.balance == null || userBank.balance - cost < 0) {
				logger.info(`User [discordId=${interaction.user.id}] tried to grow [dinoId=${dinoId}] but only had ${userbank.balance} fossils`);
				return await sc.reply('You do not have enough fossils to afford that!');
			}
	
			if (user.steamId === null) {
				logger.info(`User [discordId=${interaction.user.id}] tried to grow [dinoId=${dinoId}] but did not have steam linked`);
				return await sc.reply('You need to link your steam ID first with /link!');
			}
	
			const growDino = await new GrowDinoRequest({ growStatus: growStatusEnum.initialize, cost, initiatedByDiscordId: interaction.user.id, dinoName: dinoData[dinoId].value, UserId: user.id }).save();
			

			const playerData = await playerDataBaseAccessor.doesPlayerFileExist(user.steamId);
			logger.info(`Executing ${interaction.commandName} looking for player save for ${user.steamId}`);
			if(playerData) {
				await GrowDinoRequest.update({ growStatus: growStatusEnum.waitingOnUser }, { where: { id: growDino.id } });
				const playerJson = await playerDataBaseAccessor.getPlayerSave(user.steamId);
				const parsedJon = JSON.parse(playerJson);
				const dinoName = `${dinoData[parsedJon.CharacterClass].displayName}-${uuid.v4()}`;
				await new DinoVault({dinoDisplayName: dinoData[parsedJon.CharacterClass].displayName, savedName: dinoName, dinoJson: playerJson}).save();
				logger.info(`User [discordId=${interaction.user.id}] accepted to grow [dinoId=${dinoId}] and slay the existing dino`);
				isCollectionSuccess = true;
				await GrowDinoRequest.update({ growStatus: growStatusEnum.processing }, { where: { id: growDino.id } });
				await updateDinoFile(interaction, user, userBank, dinoId, cost);
				await GrowDinoRequest.update({ growStatus: growStatusEnum.processed }, { where: { id: growDino.id } });
				await sc.reply(`Your grow has been processed! Your existing dino was vaulted with name: ${dinoName}`);
			} else {
				logger.info(`User [discordId=${interaction.user.id}] has requested to grow [dinoId=${dinoId}] with no existing dino`);
				await writeNewDino(interaction, user, userBank, dinoId, cost);
				await sc.reply('Your grow has been processed!');
			}
			await interaction.editReply('Done!');
			selectCollector.stop();
		});
	},
};

async function updateDinoFile(interaction, user, userBank, dinoId, cost) {
	const newFile = new DinoFactory()
		.setCharacterClass(dinoId)
		.setCharacterPosition("X=466765.250 Y=121168.438 Z=-46759.008")
		.setCharacterRotation("P=0.000000 Y=109.426399 R=0.000000")
		.setCharacterThirst(31)
		.setCharacterStamina(182)
		.setCharacterGrowth(1.000000)
		.setCharacterHealth(1500)
		.setCharacterHunger(1.000000)
		.setCharacterBrokenLegs(false)
		.setCharacterGender(false)
		.setCharacterResting(false)
		.setCharacterProgressionPoints(2)
		.setCharacterProgressionTier(2)
		.setCharacterCamerRotation("P=0.000000 Y=-160.573532 R=0.000000")
		.setCharacterCameraDistance("250.012924")
		.setCharacterSkinPaletteSectionSix(254)
		.setCharacterSkinPaletteSectionFive(28)
		.setCharacterSkinPaletteSectionFour(12)
		.setCharacterSkinPaletteSectionThree(22)
		.setCharacterSkinPaletteSectionTwo(8)
		.setCharacterSkinPaletteSectionOne(25)
		.setCharacterSkinPaletteVariation("6.0")
		.render();
	await playerDataBaseAccessor.writePlayerSave(user.steamId, newFile);
	await userBank.update({ where: { UserId: user.id } }, { balance: userBank.balance - cost });
}

async function writeNewDino(interaction, user, userBank, dinoId, cost) {
	const newFile = new DinoFactory()
		.setCharacterClass(dinoId)
		.setCharacterPosition("X=466765.250 Y=121168.438 Z=-46759.008")
		.setCharacterRotation("P=0.000000 Y=109.426399 R=0.000000")
		.setCharacterThirst(31)
		.setCharacterStamina(182)
		.setCharacterGrowth(1.000000)
		.setCharacterHealth(1500)
		.setCharacterHunger(1.000000)
		.setCharacterBrokenLegs(false)
		.setCharacterGender(false)
		.setCharacterResting(false)
		.setCharacterProgressionPoints(2)
		.setCharacterProgressionTier(2)
		.setCharacterCamerRotation("P=0.000000 Y=-160.573532 R=0.000000")
		.setCharacterCameraDistance("250.012924")
		.setCharacterSkinPaletteSectionSix(254)
		.setCharacterSkinPaletteSectionFive(28)
		.setCharacterSkinPaletteSectionFour(12)
		.setCharacterSkinPaletteSectionThree(22)
		.setCharacterSkinPaletteSectionTwo(8)
		.setCharacterSkinPaletteSectionOne(25)
		.setCharacterSkinPaletteVariation("6.0")
		.render();

	console.log(newFile)

	await playerDataBaseAccessor.writePlayerSave(user.steamId, newFile);
	await userBank.update({ where: { UserId: user.id } }, { balance: userBank.balance - cost });
}
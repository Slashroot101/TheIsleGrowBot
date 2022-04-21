const { SlashCommandBuilder } = require('@discordjs/builders');
const { exists } = require('fs');
const { playerDatabase, maxApex } = require('../config');
const User = require('../model/User');
const {Op} = require('sequelize');
const dinoData = require('./commandData/dino.json');
const { UserBank, GrowDinoRequest, DinoStats } = require('../model');
const growStatusEnum = require('../model/Enum/GrowStatusEnum');
const { MessageActionRow, MessageButton } = require('discord.js');
const IslePlayerDatabase = require('../lib/IslePlayerDatabase');
const DinoFactory = require('../lib/DinoFactory');
const logger = require('../lib/logger');
const playerDataBaseAccessor = new IslePlayerDatabase(process.env.playerDatabase);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inject')
		.setDescription('Uses fossils to inject your dino on the server. Use command /grow if you already have a dino with a skin that you would like to grow.')
		.addStringOption(opt => {
			const options = opt.setName('dino').setDescription('Dinosaurs that have a cost.');
			options.setRequired(false);
			for (const key in dinoData) {
				if (dinoData[key].cost === 0) continue;
				options.addChoice(`${dinoData[key].displayName} (${dinoData[key].cost} fossils)`, dinoData[key].value);
			}

			return opt;
		},
		)
		.addStringOption(opt => {
			const options = opt.setName('freedino').setDescription('Dinosaurs that do not have a cost.');
			options.setRequired(false);
			for (const key in dinoData) {
				if (dinoData[key].cost !== 0) continue;
				options.addChoice(`${dinoData[key].displayName} (0 fossils)`, dinoData[key].value);
			}

			return opt;
		},
		),
	cooldown: {
		hasCooldown: true,
		cooldownExecutions: 1,
		cooldownInMinutes: 7200,
	},
	adminRequired: false,
	requiresSteamLink: true,
	async execute(interaction) {
		const dinoId = interaction.options.get('dino')?.value || interaction.options.get('freedino').value || null;
		const user = await User.findOne({ where: { discordId: interaction.user.id } });

		if (user.steamId === null) {
			logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but the user did not have steam linked`);
			return interaction.reply('You must have linked your steam ID before you can use the grow command!');
		}

		if (user.isApexApproved === 'N' && dinoData[dinoId].requiresApex) {
			logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but the user was not apex approved`)
			return interaction.reply('You must be apex approved to grow this dino!');
		}

		if(!dinoId) {
			logger.info(`Executing ${interaction.commandName} for user [userId=${user.discordId}] but the user did not supply a dino`);
			return interaction.reply('You must supply a dino to grow!');
		}

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
				return interaction.reply('There are too many of that apex on the server. Try again when there are not.');
			}
		}

		const userBank = await UserBank.findOne({ where: { UserId: user.id } });
		const cost = dinoData[dinoId].cost;

		if (cost !== 0 && userBank === null || userBank.balance == null || userBank.balance - cost < 0) {
			logger.info(`User [discordId=${interaction.user.id}] tried to grow [dinoId=${dinoId}] but only had ${userbank.balance} fossils`);
			return interaction.reply('You do not have enough fossils to afford that!');
		}

		if (user.steamId === null) {
			logger.info(`User [discordId=${interaction.user.id}] tried to grow [dinoId=${dinoId}] but did not have steam linked`);
			return interaction.reply('You need to link your steam ID first with /link!');
		}

		const growDino = await new GrowDinoRequest({ growStatus: growStatusEnum.initialize, cost, initiatedByDiscordId: interaction.user.id, dinoName: dinoData[dinoId].value, UserId: user.id }).save();

		exists(`${playerDatabase}/Survival/Players/${user.steamId}.json`, async (dinoExists) => {
			if (dinoExists) {
				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('DinoGrowAccept')
							.setLabel('Yes')
							.setStyle('SUCCESS'),
						new MessageButton()
							.setCustomId('DinoGrowDeny')
							.setLabel('No')
							.setStyle('DANGER'),
					);

				await GrowDinoRequest.update({ growStatus: growStatusEnum.waitingOnUser }, { where: { id: growDino.id } });

				await interaction.deferReply();
				await interaction.editReply({ content: 'Do you want to slay your existing dino and inject/grow this one?', components: [row] });

				const filter = i => i.customId === 'DinoGrowAccept' || i.customId === 'DinoGrowDeny';

				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
				let isCollectionSuccess = false;
				collector.on('collect', async i => {
					if (i.customId === 'DinoGrowAccept') {
						logger.info(`User [discordId=${interaction.user.id}] accepted to grow [dinoId=${dinoId}] and slay the existing dino`);
						isCollectionSuccess = true;
						collector.stop();
						await GrowDinoRequest.update({ growStatus: growStatusEnum.processing }, { where: { id: growDino.id } });
						await updateDinoFile(interaction, user, userBank, dinoId, cost);
						await GrowDinoRequest.update({ growStatus: growStatusEnum.processed }, { where: { id: growDino.id } });
						await i.reply('Your grow has been processed!');
					}
					else if (i.customId === 'DinoGrowDeny') {
						logger.info(`User [discordId=${interaction.user.id}] denied growing [dinoId=${dinoId}] due to existing dino`);
						isCollectionSuccess = true;
						collector.stop();
						await GrowDinoRequest.update({ growStatus: growStatusEnum.declined }, { where: { id: growDino.id } });
						await i.reply('Cancelling dino grow!');
					}

					collector.stop();
				});

				collector.on('end', () => {
					if (!isCollectionSuccess) {
						interaction.editReply('Command timed out. Please run the command again!');
					}
				});
			} else {
				logger.info(`User [discordId=${interaction.user.id}] has requested to grow [dinoId=${dinoId}] with no existing dino`);
				await writeNewDino(interaction, user, userBank, dinoId, cost);
				await interaction.reply('Your grow has been processed!');
			}
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
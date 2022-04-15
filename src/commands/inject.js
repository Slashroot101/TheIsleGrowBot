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
const playerDataBaseAccessor = new IslePlayerDatabase(process.env.playerDatabase);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('inject')
		.setDescription('Uses fossils to inject your dino on the server.')
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
		const dinoId = interaction.options.get('dino')?.value || interaction.options.get('freedino').value;
		const user = await User.findOne({ where: { discordId: interaction.user.id } });

		if (user.steamId === null) {
			return interaction.reply('You must have linked your steam ID before you can use the grow command!');
		}

		if (user.isApexApproved === 'N' && dinoData[dinoId].requiresApex) {
			return interaction.reply('You must be apex approved to grow this dino!');
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
			console.log(Number(maxApex));
			if(dinoStats.map(x => x.dataValues).reduce((a, b) => b.count + a, 0) >= Number(maxApex)){
				return interaction.reply('There are too many of that apex on the server. Try again when there are not.');
			}
		}

		const userBank = await UserBank.findOne({ where: { UserId: user.id } });
		const cost = dinoData[dinoId].cost;

		if (cost !== 0 && userBank === null || userBank.balance == null || userBank.balance - cost < 0) {
			return interaction.reply('You do not have enough fossils to afford that!');
		}

		if (user.steamId === null) {
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

				await interaction.reply({ content: 'Do you want to slay your existing dino and inject/grow this one?', components: [row] });

				const filter = i => i.customId === 'DinoGrowAccept' || i.customId === 'DinoGrowDeny';

				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });
				let isCollectionSuccess = false;
				collector.on('collect', async i => {
					if (i.customId === 'DinoGrowAccept') {
						isCollectionSuccess = true;
						collector.stop();
						await GrowDinoRequest.update({ growStatus: growStatusEnum.processing }, { where: { id: growDino.id } });
						await updateDinoFile(interaction, user, userBank, dinoId, cost);
						await GrowDinoRequest.update({ growStatus: growStatusEnum.processed }, { where: { id: growDino.id } });
						await i.reply('Your grow has been processed!');
					}
					else if (i.customId === 'DinoGrowDeny') {
						isCollectionSuccess = true;
						collector.stop();
						await GrowDinoRequest.update({ growStatus: growStatusEnum.declined }, { where: { id: growDino.id } });
						await i.reply('Cancelling dino grow!');
					}
				});

				collector.on('end', () => {
					if (!isCollectionSuccess) {
						interaction.reply('Command timed out. Please run the command again!');
					}
				});
			} else {
				await writeNewDino(interaction, user, userBank, dinoId, cost);
				await interaction.reply('Your grow has been processed!');
			}
		});
	},
};

async function updateDinoFile(interaction, user, userBank, dinoId, cost) {
	const userSave = await playerDataBaseAccessor.getPlayerSave(user.steamId);
	const json = JSON.parse(userSave);
	json.CharacterClass = dinoId;
	await playerDataBaseAccessor.writePlayerSave(user.steamId, JSON.stringify(json));
	await userBank.update({ where: { UserId: user.id } }, { balance: userBank.balance - cost });
}

async function writeNewDino(interaction, user, userBank, dinoId, cost) {
	const newFile = new DinoFactory()
		.setCharacterClass(dinoId)
		.render();

	await playerDataBaseAccessor.writePlayerSave(user.steamId, JSON.stringify(newFile));
	await userBank.update({ where: { UserId: user.id } }, { balance: userBank.balance - cost });
}
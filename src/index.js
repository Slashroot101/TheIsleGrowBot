const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const { token, natsUrl, stripeWebhook, syncDb } = require('./config');
const { initializeCommands } = require('./deploy-commands');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const path = require('path');
const database = require('./database');
const { Op } = require('sequelize');
const { deployRoles } = require('./deploy-roles');
const { User, CommandAudit, UserCommandBlacklist } = require('./model');
const { connect } = require('nats');
const Models = require('./model');
const queueSubscriptions = require('./queueSubscriptions');
const { subMinutes, formatDistance, addMinutes } = require('date-fns');
const { createWebhooks } = require('./lib/stripeAccessor');
const logger = require('./lib/logger');

(async () => {
	const nats = await connect({
		url: natsUrl,
	});

	Object.keys(Models).forEach((ele) => {
		Models[ele].associate(Models);
	});
	await database.dbConnection.sync({ force: false });
	await initializeCommands();
	await createWebhooks(`${stripeWebhook}/donate`);

	client.once('ready', async () => {
		await deployRoles(client);
		await queueSubscriptions(nats, client);
		console.log('ready!');
	});

	client.on('interactionCreate', async interaction => {
		if (!interaction.isCommand()) return;
		let user = await User.findOne({ where: { discordId: interaction.user.id } });
		if (!user) {
			logger.info(`User [discordId=${user.id}] was not found in the database, creating.`);
			user = await new User({ discordId: interaction.user.id }).save();
			await new Models.UserBank({ UserId: user.id, balance: 0 }).save();
		}

		if (user.isBlacklisted === 'Y') {
			logger.info(`User [discordId=${user.id}] was blacklisted, neglecting.`);
			return interaction.reply('You cannot use commands! You are blacklisted!');
		}

		const command = client.commands.get(interaction.commandName);
		if (!command) return;

		const savedCommand = await Models.Command.findOne({ where: { name: interaction.commandName } });
		const commandBlacklist = await UserCommandBlacklist.findAll({ where: { UserId: user.id, CommandId: command.id } });

		if (commandBlacklist.length) {
			logger.info(`User [discordId=${user.id}] was blacklisted from the command ${interaction.commandName}, neglecting`);
			return interaction.reply('You are blacklisted from that command! Reach out to an admin if you think that is a mistake');
		}

		if (savedCommand.isMaintenanceModeEnabled) {
			logger.info(`User [discordId=${user.id}] tried to run ${interaction.commandName} but it was in maintenance mode, neglecting`);
			return interaction.reply(`${savedCommand.name} is currently in maintenance mode! Please try again later, or contact an admin.`);
		}

		if (command.cooldown.hasCooldown && (user.isAdmin === 'N' || user.isAdmin === null)) {
			const commandRange = subMinutes(new Date(), command.cooldown.cooldownInMinutes);
			const commandExecutions = await CommandAudit.findAll({ where: { UserId: user.id, executionTime: { [Op.gt]: commandRange }, CommandId: command.id }, order: [['executionTime', 'desc']] });
			if (commandExecutions.length >= command.cooldown.cooldownExecutions) {
				logger.info(`User [discordId=${user.id}] tried to run ${interaction.commandName} but the command was on cooldown, neglecting`);
				const commandNextDate = addMinutes(new Date(commandExecutions[0].executionTime), command.cooldown.cooldownInMinutes);
				return interaction.reply(`This command is on cooldown for you for ${formatDistance(commandNextDate, new Date())}`);
			}
		}
		if (command.adminRequired && user.dataValues.isAdmin === 'N' || user.dataValues.isAdmin === null) {
			logger.info(`User [discordId=${user.id}] tried to run ${interaction.commandName} but the command required admin which they did not have, neglecting`)
			return interaction.reply('You must be an admin to use that command!');
		}

		if (command.requiresSteamLink !== undefined && command.requiresSteamLink === true && !user.steamId) {
			logger.info(`User [discordId=${user.id}] tried to run ${interaction.commandName} but the command required steam to be linked, neglecting`);
			return interaction.reply('Your steam must be linked to run this command!');
		}

		try {
			await new CommandAudit({ executionTime: new Date(), cost: null, CommandId: command.id, UserId: user.id }).save();
			await command.execute(interaction, client);
		}
		catch (error) {
			console.log(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	});

	client.commands = new Collection();
	const commandFiles = fs.readdirSync(path.resolve(__dirname, './commands')).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(path.resolve(__dirname, `./commands/${file}`));
		client.commands.set(command.data.name, command);
	}

	await client.login(token);

})();
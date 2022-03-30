const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token, guildId } = require('./config');
const fs = require('fs');
const path = require('path');
const {Command} = require('./model');
const { fil } = require('date-fns/locale');

exports.initializeCommands = async () => {
    const commands = [];
    const commandFiles = fs.readdirSync(path.resolve(__dirname, './commands')).filter(file => file.endsWith('.js'));
    const storedCommands = await Command.findAll({where: {}});
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        var filterCommand = storedCommands.filter(x => x.fileName === file);

        if(!filterCommand.length){
            console.log(command.cooldown.hasCooldown)
            const savedCommand = await new Command({
                fileName: file,
                name: command.data.name,
                requiresAdmin: command.adminRequired,
                cost: null,
                hasCooldown: command.cooldown.hasCooldown,
                cooldownExecutions: command.cooldown.cooldownExecutions,
                cooldownInMinutes: command.cooldown.cooldownInMinutes,
                requiresSteamLink: command.requiresSteamLink === null ? false : true,
                isMaintenanceModeEnabled: false,
            }).save();
            command.id = savedCommand.id;
        } else {
            await Command.update({
                fileName: file,
                name: command.data.name,
                requiresAdmin: command.adminRequired,
                cost: null,
                hasCooldown: command.cooldown.hasCooldown,
                cooldownExecutions: command.cooldown.cooldownExecutions,
                cooldownInMinutes: command.cooldown.cooldownInMinutes,
                requiresSteamLink: command.requiresSteamLink === null ? false : true,
                isMaintenanceModeEnabled: filterCommand[0].isMaintenanceModeEnabled,
            },{where: {id: filterCommand[0].id}});
            command.id = filterCommand[0].id;
            command.isMaintenanceModeEnabled = filterCommand[0].isMaintenanceModeEnabled;
        }

        commands.push(command.data.toJSON());
    }
    
    const rest = new REST({ version: '9' }).setToken(token);
    
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}


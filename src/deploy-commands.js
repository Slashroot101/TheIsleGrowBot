const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, token, guildId } = require('./config');
const fs = require('fs');
const path = require('path');

exports.initializeCommands = () => {
    const commands = [];
    const databaseCommands = [];
    const commandFiles = fs.readdirSync(path.resolve(__dirname, './commands')).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        console.log(command.data)
        databaseCommands.push({
            fileName: file,
            name: command.data.name,
            requiresAdmin: command.adminRequired,
            cost: null,
            hasCooldown: command.cooldown.hasCooldown,
        });
        commands.push(command.data.toJSON());
    }
    
    const rest = new REST({ version: '9' }).setToken(token);
    
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
}


const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const { token } = require('./config');
const {initializeCommands} = require('./deploy-commands');
const client = new Client({intents: [Intents.FLAGS.GUILDS]});
const path = require('path');
const database = require('./database');
const {deployRoles} = require('./deploy-roles');
const { User } = require('./model');
const Models = require('./model');
let hasInitializationCompleted = false;

(async () => {
    initializeCommands();
    Object.keys(Models).forEach((ele) => {
        Models[ele].associate(Models);
    });
    await database.dbConnection.sync({force: true});

    client.once('ready', async () => {
        console.log('ready!');
        await deployRoles(client);
        hasInitializationCompleted = true;
    });
    
    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;
        if(!hasInitializationCompleted) return interaction.reply('the bot is starting up!');
        const user = await User.findOne({where: { discordId: interaction.user.id }});
        if(!user){
            await new User({discordId: interaction.user.id}).save();
        }
        const command = client.commands.get(interaction.commandName);
    
        if (!command) return;
    
        try {
            await command.execute(interaction);
        } catch (error) {
            console.log(error)
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
    
    client.commands = new Collection();
    const commandFiles = fs.readdirSync(path.resolve(__dirname, './commands')).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(path.resolve(__dirname, `./commands/${file}`));
        // Set a new item in the Collection
        // With the key as the command name and the value as the exported module
        client.commands.set(command.data.name, command);
    }
    
    client.login(token);
})();


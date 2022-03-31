const {SlashCommandBuilder} = require('@discordjs/builders');
const {User} = require('../model');
const {createPaymentLink} = require('../lib/stripeAccessor');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .addIntegerOption(opt => opt.setName('amount').setDescription('How many fossils you would like to donate for'))
        .setDescription('Creates a payment link for you to buy fossils from'),
    adminRequired: false,
    cooldown: {
        hasCooldown: true,
        cooldownExecutions: 5,
        cooldownInMinutes: 1,
    },
    async execute(interaction) {
      const amount = interaction.options.get('amount').value;
      if(amount === 0){
        return interaction.reply('You have to donate a non-zero amount :^)');
      }
      const link = await createPaymentLink(amount);
      return interaction.reply(`Thank you for considering donating! Here is your donation link for ${amount} fossils: ` + link.url);
    }
};
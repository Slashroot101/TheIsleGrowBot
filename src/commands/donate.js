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
      if(amount % 25 !== 0){
        return interaction.reply('You must donate in amounts of 25 embers due to payment processing restrictions on minimum transaction amounts! Example: 25 embers, 75 embers, etc.');
      }
      const link = await createPaymentLink(amount / 25);

      return interaction.reply(`Thank you for considering donating! Here is your donation link for ${amount} fossils: ` + link.url);
    }
};
const {SlashCommandBuilder} = require('@discordjs/builders');
const {User} = require('../model');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('linkemail')
        .addStringOption(opt => opt.setName('email').setDescription('The email address you want donation receipts sent to.'))
        .setDescription('Links your email account to fossil bot for donations. Your email WILL NOT be shared.'),
    adminRequired: false,
    cooldown: {
        hasCooldown: true,
        cooldownExecutions: 5,
        cooldownInMinutes: 1,
    },
    async execute(interaction) {
      const email = interaction.options.get('email').value;
      const user = await User.findOne({where: {discordId: interaction.user.id}});
      const isValidEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(email);

      if(!isValidEmail) {
        return interaction.reply('You must provide a valid email!');
      }

      await User.update({emailAddress: email}, {where: {id: user.id}});
      return interaction.reply('Your email was succesfully linked!');
    }
};
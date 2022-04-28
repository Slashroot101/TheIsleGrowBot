module.exports = async (client, guildId, channelId, messageId) => {
  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(channelId);
  return await channel.messages.fetch(messageId);
};
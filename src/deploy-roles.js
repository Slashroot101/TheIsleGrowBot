const seedData = require('./seedData/roles.json');
const { guildId } = require('./config');
const logger = require('./lib/logger');

exports.deployRoles = async (client) => {
	const roles = seedData.roles;
	const guild = client.guilds.cache.get(guildId);
	logger.info(`Deploying roles for [guildId=${guildId}]`);
	if (!guild) throw new Error('No guild registered');
	for (const role of roles) {
		const doesRoleExist = guild.roles.cache.filter(x => x.name === role.name);
		if (doesRoleExist.size) {
			const [firstValue] = doesRoleExist.keys();
			logger.info(`Role [roleId=${firstValue}] was already deployed to the server. Skipping, but adding to array`);
			this.instanceRoles.set(role.code, { id: firstValue });
			continue;
		}
		logger.info(`Deploying role ${role.name} with color ${role.color} for guild [guildId=${guildId}]`);
		const createdRole = await guild.roles.create({
			name: role.name,
			color: role.color,
			reason: 'Fossil bot required roles!',
		});
		this.instanceRoles.set(role.code, { id: createdRole.id });
	}
};

exports.instanceRoles = new Map();
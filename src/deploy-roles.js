const seedData = require('./seedData/roles.json');
const { guildId } = require('./config');

exports.deployRoles = async (client) => {
	const roles = seedData.roles;
	const guild = client.guilds.cache.get(guildId);

	if (!guild) throw new Error('No guild registered');
	for (const role of roles) {
		const doesRoleExist = guild.roles.cache.filter(x => x.name === role.name);
		if (doesRoleExist.size) {
			const [firstValue] = doesRoleExist.keys();
			this.instanceRoles.set(role.code, { id: firstValue });
			continue;
		}

		const createdRole = await guild.roles.create({
			name: role.name,
			color: role.color,
			reason: 'Fossil bot required roles!',
		});
		this.instanceRoles.set(role.code, { id: createdRole.id });
	}
};

exports.instanceRoles = new Map();